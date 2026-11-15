// Pimba v1.4.0 — Cloudflare Worker
// - /.well-known/assetlinks.json → liga o app Android (TWA) ao site, a partir de SITE.app.sha256
// - Serve os arquivos estáticos de dist/ (binding ASSETS)
// - /api/resultado/:slug[/:concurso] e /api/resultados → proxy da API da Caixa, normalizado e com cache
// - /api/estatisticas/:slug?n=50 → números mais/menos sorteados nos últimos N concursos (histórico em cache)
// - /resultados/:slug/ e /resultados/:slug/:concurso/ → página renderizada no servidor (bom para SEO)
// - /estatisticas/:slug/ → página de estatísticas renderizada no servidor

import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { normalizar, renderResultado, seo } from '../assets/js/render.js';
import { SITE } from '../src/config.js';
import { assetLinks } from '../scripts/app.mjs';
import { JANELA_MAX, JANELA_PADRAO, compactar, calcularEstatisticas, janelaValida, renderEstatisticas, temEstatistica } from '../assets/js/stats.js';

const CAIXA_BASE = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
const TTL_ULTIMO = 300; // 5 min para o último concurso
const TTL_ANTIGO = 60 * 60 * 24 * 30; // 30 dias para concursos já apurados

// Busca direto na Caixa, sem passar pelo cache (usado para montar o histórico das estatísticas).
async function buscarCaixaDireto(lot, concurso, env) {
  const raw = await baixarCaixa(lot, concurso, env);
  return normalizar(raw, lot);
}

async function baixarCaixa(lot, concurso, env) {
  const base = env.CAIXA_API_BASE || CAIXA_BASE;
  const url = `${base}/${lot.api}${concurso ? `/${concurso}` : ''}`;
  const resp = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; PimbaBot/1.0; +https://pimba.com.br)',
    },
    cf: { cacheTtl: 60 },
  });
  if (!resp.ok) throw new Error(`Caixa respondeu ${resp.status}`);
  const texto = await resp.text();
  let raw;
  try {
    raw = JSON.parse(texto);
  } catch {
    throw new Error('Caixa não devolveu JSON');
  }
  return raw;
}

async function buscarCaixa(lot, concurso, env, ctx) {
  const cache = caches.default;
  const chave = new Request(`https://cache.pimba/${lot.api}/${concurso || 'ultimo'}`);
  const emCache = await cache.match(chave);
  if (emCache) return emCache.json();

  const raw = await baixarCaixa(lot, concurso, env);
  const dados = normalizar(raw, lot);
  const ttl = concurso && !raw.ultimoConcurso ? TTL_ANTIGO : TTL_ULTIMO;
  ctx.waitUntil(
    cache.put(chave, new Response(JSON.stringify(dados), { headers: { 'Cache-Control': `public, max-age=${ttl}` } })),
  );
  return dados;
}

// ---------- estatísticas ----------
// O plano grátis do Workers permite 50 subrequests (fetch + Cache API) por requisição. Por isso o histórico dos
// últimos JANELA_MAX concursos fica numa única entrada de cache por loteria e é completado aos poucos:
// no máximo MAX_BUSCAS concursos novos por requisição (normalmente só 1, o concurso que acabou de sair).
const MAX_BUSCAS = 36;
const TTL_HIST = 60 * 60 * 24 * 30;

async function historico(lot, env, ctx) {
  const ultimo = await buscarCaixa(lot, null, env, ctx);
  const cache = caches.default;
  const chave = new Request(`https://cache.pimba/hist/${lot.api}`);
  const emCache = await cache.match(chave);
  const salvo = emCache ? await emCache.json().catch(() => []) : [];
  const porConcurso = new Map(salvo.map((h) => [h.c, h]));
  porConcurso.set(ultimo.concurso, compactar(ultimo));

  const menor = Math.max(1, ultimo.concurso - JANELA_MAX + 1);
  const faltam = [];
  for (let c = ultimo.concurso; c >= menor; c--) if (!porConcurso.has(c)) faltam.push(c);
  const lote = faltam.slice(0, MAX_BUSCAS);
  for (let i = 0; i < lote.length; i += 6) {
    const grupo = await Promise.all(lote.slice(i, i + 6).map((c) => buscarCaixaDireto(lot, c, env).catch(() => null)));
    for (const r of grupo) if (r) porConcurso.set(r.concurso, compactar(r));
  }

  const hist = [...porConcurso.values()].filter((h) => h.c >= menor).sort((a, b) => b.c - a.c);
  const mudou = !emCache || hist.length !== salvo.length || hist[0]?.c !== salvo[0]?.c;
  if (mudou) {
    ctx.waitUntil(cache.put(chave, new Response(JSON.stringify(hist), { headers: { 'Cache-Control': `public, max-age=${TTL_HIST}` } })));
  }
  return { hist, ultimo: ultimo.concurso };
}

async function estatisticas(lot, janela, env, ctx) {
  const { hist, ultimo } = await historico(lot, env, ctx);
  const est = calcularEstatisticas(hist, lot, janela);
  est.parcial = est.concursos < Math.min(janela, ultimo);
  return est;
}

const json = (obj, status = 200, maxAge = 120) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': status === 200 ? `public, max-age=${maxAge}` : 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });

async function api(url, env, ctx) {
  const partes = url.pathname.split('/').filter(Boolean); // ['api', 'resultado', slug, n]
  if (partes[1] === 'resultados') {
    const todos = await Promise.all(
      LOTERIAS.map((l) => buscarCaixa(l, null, env, ctx).catch(() => null)),
    );
    return json(Object.fromEntries(LOTERIAS.map((l, i) => [l.slug, todos[i]])));
  }
  if (partes[1] === 'resultado') {
    const lot = POR_SLUG[partes[2]];
    if (!lot) return json({ erro: 'Loteria não encontrada' }, 404);
    const n = partes[3] ? parseInt(partes[3], 10) : null;
    if (partes[3] && !(n > 0)) return json({ erro: 'Concurso inválido' }, 400);
    try {
      const d = await buscarCaixa(lot, n, env, ctx);
      return json(d, 200, n && !d.ultimo ? 86400 : 120);
    } catch (e) {
      return json({ erro: 'Não foi possível consultar a Caixa agora.', detalhe: String(e.message || e) }, 502);
    }
  }
  if (partes[1] === 'estatisticas') {
    const lot = POR_SLUG[partes[2]];
    if (!lot || !temEstatistica(lot)) return json({ erro: 'Loteria sem estatísticas' }, 404);
    try {
      const est = await estatisticas(lot, janelaValida(url.searchParams.get('n')), env, ctx);
      return json(est, 200, est.parcial ? 10 : 300);
    } catch (e) {
      return json({ erro: 'Não foi possível consultar a Caixa agora.', detalhe: String(e.message || e) }, 502);
    }
  }
  return json({ erro: 'Rota não encontrada' }, 404);
}

async function paginaEstatisticas(req, url, env, ctx) {
  const m = url.pathname.match(/^\/estatisticas\/([a-z-]+)\/?$/);
  const lot = m && POR_SLUG[m[1]];
  if (!lot || !temEstatistica(lot)) return env.ASSETS.fetch(req);
  if (!url.pathname.endsWith('/')) return Response.redirect(`${url.origin}${url.pathname}/`, 301);
  const template = await env.ASSETS.fetch(new Request(new URL(`/estatisticas/${lot.slug}/`, url.origin)));
  if (!template.ok) return template;

  let est;
  try {
    est = await estatisticas(lot, JANELA_PADRAO, env, ctx);
  } catch {
    return template; // o navegador tenta buscar sozinho
  }
  if (est.parcial) return template;
  const resp = new HTMLRewriter()
    .on('#estatisticas', {
      element: (el) => {
        el.setAttribute('data-ssr', '1');
        el.setInnerContent(renderEstatisticas(est, lot), { html: true });
      },
    })
    .transform(template);
  const headers = new Headers(resp.headers);
  headers.set('Cache-Control', 'public, max-age=300');
  return new Response(resp.body, { status: 200, headers });
}

async function paginaResultado(req, url, env, ctx) {
  const m = url.pathname.match(/^\/resultados\/([a-z-]+)\/(?:(\d+)\/?)?$/);
  if (!m) return env.ASSETS.fetch(req);
  const lot = POR_SLUG[m[1]];
  if (!lot) return env.ASSETS.fetch(req);
  if (!url.pathname.endsWith('/')) return Response.redirect(`${url.origin}${url.pathname}/`, 301);
  const n = m[2] ? parseInt(m[2], 10) : null;

  const template = await env.ASSETS.fetch(new Request(new URL(`/resultados/${lot.slug}/`, url.origin)));
  if (!template.ok) return template;

  let dados = null;
  try {
    dados = await buscarCaixa(lot, n, env, ctx);
  } catch {
    // Sem dados: entrega o template e o navegador tenta buscar sozinho.
    if (n) {
      return new HTMLRewriter()
        .on('#resultado', { element: (el) => el.setAttribute('data-concurso', String(n)) })
        .on('meta[name="robots"]', { element: (el) => el.setAttribute('content', 'noindex') })
        .transform(template);
    }
    return template;
  }

  const meta = seo(dados, lot);
  const canonical = `${url.origin}/resultados/${lot.slug}/${dados.concurso}/`;
  const html = renderResultado(dados, lot);
  const resp = new HTMLRewriter()
    .on('title', { element: (el) => el.setInnerContent(meta.title) })
    .on('meta[name="description"]', { element: (el) => el.setAttribute('content', meta.description) })
    .on('meta[property="og:title"]', { element: (el) => el.setAttribute('content', meta.title) })
    .on('meta[property="og:description"]', { element: (el) => el.setAttribute('content', meta.description) })
    .on('link[rel="canonical"]', { element: (el) => el.setAttribute('href', n ? canonical : `${url.origin}/resultados/${lot.slug}/`) })
    .on('h1 .h1-concurso', { element: (el) => el.setInnerContent(` — concurso ${dados.concurso}`) })
    .on('#resultado', {
      element: (el) => {
        el.setAttribute('data-ssr', '1');
        el.setInnerContent(html, { html: true });
      },
    })
    .transform(template);

  const headers = new Headers(resp.headers);
  headers.set('Cache-Control', n && !dados.ultimo ? 'public, max-age=86400' : 'public, max-age=120');
  return new Response(resp.body, { status: 200, headers });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    // www → raiz
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/.well-known/assetlinks.json') {
      const links = assetLinks(SITE.app);
      return links ? json(links, 200, 3600) : json({ erro: 'App Android ainda sem impressão digital (SITE.app.sha256)' }, 404);
    }
    if (url.pathname.startsWith('/api/')) return api(url, env, ctx);
    if (url.pathname.startsWith('/resultados/')) return paginaResultado(req, url, env, ctx);
    if (url.pathname.startsWith('/estatisticas/')) return paginaEstatisticas(req, url, env, ctx);
    return env.ASSETS.fetch(req);
  },
};
