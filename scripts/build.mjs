// Pimba — gerador do site estático. Uso: node scripts/build.mjs  → gera dist/
import { mkdirSync, rmSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/config.js';
import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { esc, brl, fmtInt } from '../assets/js/render.js';
import { JANELAS, JANELA_PADRAO, temEstatistica, seoEstatisticas } from '../assets/js/stats.js';
import { MODOS, MODO_PADRAO } from '../assets/js/modos.js';
import { DIAS, DIAS_CURTOS, SEMANA, sorteiosDoDia } from '../assets/js/datas.js';
import { blocoParceiro, ldParceiro, parceiroAtivo, zap } from './parceiro.mjs';
import { adsTxt, adsenseAtivo, anuncio as anuncioDe, scriptAdsense } from './anuncios.mjs';
import { manifesto, scriptModoApp, serviceWorker } from './app.mjs';
import { versionarImports } from './versionar.mjs';
import { dataLonga, ldArtigo, relacionados } from './blog.mjs';
import { ARTIGOS, CATEGORIAS } from '../conteudo/blog/index.mjs';
import { TEXTO_LOTERIA, REVISADO } from '../conteudo/loterias.mjs';
import { comb } from '../assets/js/analise.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const V = SITE.versao;
const ANO = new Date().getFullYear();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });
versionarImports(join(DIST, 'assets/js'), V);
const fonte = join(ROOT, 'node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2');
if (existsSync(fonte)) {
  mkdirSync(join(DIST, 'assets/fonts'), { recursive: true });
  cpSync(fonte, join(DIST, 'assets/fonts/outfit.woff2'));
}

const paginas = []; // para o sitemap

function salvar(rota, html, { sitemap = true, prioridade = '0.6', lastmod = '' } = {}) {
  const arq = rota === '/404' ? join(DIST, '404.html') : join(DIST, rota, 'index.html');
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(arq, html);
  if (sitemap) paginas.push({ rota, prioridade, lastmod });
}


// ---------- componentes ----------
const NAV = [
  ['/resultados/', 'Resultados'],
  ['/conferidor/', 'Conferidor'],
  ['/gerador/', 'Gerador'],
  ['/estatisticas/', 'Estatísticas'],
  ['/calendario/', 'Calendário'],
  ['/boloes/', 'Bolões'],
  ['/probabilidades/', 'Chances'],
  ['/blog/', 'Blog'],
];

const anuncio = (posicao) => anuncioDe(SITE, posicao);

const ctaWhats = () =>
  SITE.whatsappLista
    ? `<section class="cta-whats"><div class="wrap"><div><h2>Resultado no seu WhatsApp</h2><p>Receba os números assim que saírem e os bolões da semana. Sem spam.</p></div><a class="btn btn-whats" href="${esc(SITE.whatsappLista)}" target="_blank" rel="noopener">Quero receber</a></div></section>`
    : '';

// v1.7.0: `anuncios: false` tira o script do AdSense da página. Telas de ferramenta, navegação, institucionais e
// páginas finas não carregam anúncio (política do AdSense: anúncio só onde há conteúdo do editor).
function layout({ titulo, descricao, rota, corpo, scripts = [], extraHead = '', robots = 'index,follow', ogTipo = 'website', anuncios = true }) {
  const canonical = `${SITE.url}${rota}`;
  const navHtml = NAV.map(([href, txt]) => `<a href="${href}"${rota.startsWith(href) ? ' aria-current="page"' : ''}>${txt}</a>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${ogTipo}">
<meta property="og:site_name" content="Pimba">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/img/og.png">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#101935">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Pimba">
${scriptModoApp(SITE)}
<meta name="generator" content="Pimba v${V}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${SITE.googleAnalyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.googleAnalyticsId}');</script>` : ''}
${anuncios && robots.startsWith('index') ? scriptAdsense(SITE) : ''}
${extraHead}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="wrap topo-in">
    <a class="logo" href="/" aria-label="Pimba — página inicial"><span class="logo-bola" aria-hidden="true">P</span><span class="logo-txt">pimba<b>!</b></span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span></span><span></span><span></span></button>
    <nav id="menu" class="menu" aria-label="Principal">${navHtml}</nav>
  </div>
</header>
<main id="conteudo">
${corpo}
</main>
${ctaWhats()}
<footer class="rodape">
  <div class="wrap rodape-grid">
    <div>
      <a class="logo logo-rodape" href="/"><span class="logo-bola" aria-hidden="true">P</span><span class="logo-txt">pimba<b>!</b></span></a>
      <p>${esc(SITE.slogan)}</p>
      <p class="aviso-18"><strong>18+</strong> Jogue com responsabilidade.</p>
      <p class="instalar-app" data-fora-do-app>${SITE.app?.playStoreUrl ? `<a class="btn btn-sec btn-peq" href="${esc(SITE.app.playStoreUrl)}" target="_blank" rel="noopener">Baixe o app na Play Store</a> ` : ''}<button type="button" class="btn btn-sec btn-peq" id="instalar-app" hidden>Instalar o app</button></p>
    </div>
    <div>
      <h2>Resultados</h2>
      <ul>${LOTERIAS.map((l) => `<li><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Ferramentas</h2>
      <ul>
        <li><a href="/conferidor/">Conferidor de apostas</a></li>
        <li><a href="/gerador/">Gerador de números</a></li>
        <li><a href="/estatisticas/">Estatísticas</a></li>
        <li><a href="/calendario/">Calendário de sorteios</a></li>
        <li><a href="/probabilidades/">Chances de ganhar</a></li>
        <li><a href="/boloes/">Bolões</a></li>
      </ul>
    </div>
    <div>
      <h2>Pimba</h2>
      <ul>
        <li><a href="/sobre/">Sobre o Pimba</a></li>
        <li><a href="/contato/">Contato</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/jogo-responsavel/">Jogo responsável</a></li>
        <li><a href="/privacidade/">Privacidade e cookies</a></li>
        <li><a href="/termos/">Termos de uso</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap rodape-legal">
    <p>O Pimba é um site independente de informação. <strong>Não é a CAIXA, não vende apostas e não tem vínculo com as Loterias CAIXA.</strong> Resultados obtidos das fontes oficiais; confira sempre no canal oficial antes de descartar seu bilhete.</p>
    <p>© ${ANO} Pimba · v${V}</p>
  </div>
</footer>
<script type="module" src="/assets/js/app.js?v=${V}"></script>
${scripts.map((s) => `<script type="module" src="/assets/js/${s}?v=${V}"></script>`).join('\n')}
</body>
</html>`;
}

const migalhas = (itens) => {
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: itens.map(([nome, rota], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: `${SITE.url}${rota}` })),
  };
  return `<nav class="migalhas" aria-label="Você está em"><ol>${itens
    .map(([nome, rota], i) => (i < itens.length - 1 ? `<li><a href="${rota}">${esc(nome)}</a></li>` : `<li aria-current="page">${esc(nome)}</li>`))
    .join('')}</ol></nav><script type="application/ld+json">${JSON.stringify(ld)}</script>`;
};

const chips = (atual = '', secao = 'resultados', lista = LOTERIAS) =>
  `<div class="chips">${lista.map((l) => `<a class="chip${l.slug === atual ? ' ativo' : ''}" style="--cor:${l.cor}" href="/${secao}/${l.slug}/">${esc(l.nome)}</a>`).join('')}</div>`;

const tabelaOdds = (l) =>
  `<table class="tabela"><thead><tr><th>Faixa</th><th>Chance (aposta mínima)</th></tr></thead><tbody>${l.odds
    .map(([f, o]) => `<tr><td>${esc(f)}</td><td>1 em ${fmtInt(o)}</td></tr>`)
    .join('')}</tbody></table>`;

const cardArtigo = (a, h = 'h2') =>
  `<a class="ferr card-blog" href="/blog/${a.slug}/"><span class="card-blog-cat">${esc(a.categoria)}</span><${h}>${esc(a.titulo)}</${h}><p>${esc(a.descricao)}</p><span class="card-blog-meta">${a.leitura} min de leitura</span></a>`;

// ---------- HOME ----------
const faqHome = [
  ['Que horas saem os resultados das loterias?', 'De segunda a sexta, os sorteios da CAIXA acontecem às 21h (a Loteria Federal às 20h) e, aos domingos, às 11h, sempre no horário de Brasília. Desde julho de 2026 não há mais sorteios regulares aos sábados. O Pimba atualiza os resultados minutos depois da divulgação oficial. Veja o calendário completo em pimba.com.br/calendario/.'],
  ['O Pimba vende apostas?', 'Não. O Pimba é um site de informação: resultados, conferidor e ferramentas. Apostas e cotas de bolão oficiais são vendidas apenas nas lotéricas e nos canais da CAIXA (portal e aplicativo Loterias CAIXA).'],
  ['Qual a loteria mais fácil de ganhar?', 'Pela matemática, a chance de acertar o prêmio principal é maior no Dia de Sorte (1 em 2,6 milhões) e na Lotofácil (1 em 3,3 milhões). A Mega-Sena é 1 em 50 milhões. Veja a comparação completa na página de chances.'],
  ['Existe método para ganhar na loteria?', 'Não. Cada sorteio é independente e todas as combinações têm a mesma chance. Desconfie de quem vende "método garantido". O que muda a chance é apenas a quantidade de combinações que você joga.'],
];

salvar('/', layout({
  titulo: 'Pimba — Resultados da Mega-Sena, Lotofácil, Quina e todas as loterias',
  descricao: 'Resultados das loterias da CAIXA atualizados: Mega-Sena, Lotofácil, Quina, +Milionária e mais. Confira sua aposta, gere números e veja as chances reais de ganhar.',
  rota: '/',
  scripts: ['home.js'],
  extraHead: `<script type="application/ld+json">${JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Pimba', url: SITE.url, inLanguage: 'pt-BR' },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqHome.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ])}</script>`,
  corpo: `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="selo">Atualizado minutos após cada sorteio</p>
      <h1>Saiu o resultado?<br><span>Pimba, tá aqui.</span></h1>
      <p class="hero-sub">Todas as loterias da CAIXA num lugar só. Confira seu jogo em segundos, veja quanto pagou cada faixa e quanto está acumulado.</p>
      <div class="hero-ctas">
        <a class="btn btn-primario" href="/conferidor/">Conferir meu jogo</a>
        <a class="btn btn-sec" href="/resultados/">Ver todos os resultados</a>
      </div>
    </div>
    <aside class="hero-destaque" id="maior-premio" aria-live="polite">
      <p class="hd-label">Maior prêmio em jogo</p>
      <p class="hd-valor">—</p>
      <p class="hd-info">Carregando…</p>
    </aside>
  </div>
</section>

<section class="secao">
  <div class="wrap">
    <div class="secao-topo"><h2>Últimos resultados</h2><a href="/resultados/">Todas as loterias →</a></div>
    <div class="grid-res" id="home-resultados">
      ${LOTERIAS.map((l) => `<article class="card-res esqueleto" style="--cor:${l.cor}"><header><h3><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></h3></header><p class="muted">Carregando…</p></article>`).join('')}
    </div>
  </div>
</section>

${blocoParceiro(SITE.parceiro, { variante: 'home' })}

<section class="secao secao-alt">
  <div class="wrap">
    <h2>Ferramentas grátis</h2>
    <div class="grid-ferr">
      <a class="ferr" href="/conferidor/"><span class="ferr-ico" aria-hidden="true">✓</span><h3>Conferidor</h3><p>Marque seus números e veja na hora quantos acertou e quanto pagou.</p></a>
      <a class="ferr" href="/gerador/"><span class="ferr-ico" aria-hidden="true">🎲</span><h3>Gerador de números</h3><p>Sem ideia de números? Gere jogos aleatórios para qualquer loteria.</p></a>
      <a class="ferr" href="/estatisticas/"><span class="ferr-ico" aria-hidden="true">#</span><h3>Estatísticas</h3><p>Os números que mais e menos saíram nos últimos concursos.</p></a>
      <a class="ferr" href="/calendario/"><span class="ferr-ico" aria-hidden="true">📅</span><h3>Calendário</h3><p>Que dia e que horas tem sorteio de cada loteria.</p></a>
      <a class="ferr" href="/probabilidades/"><span class="ferr-ico" aria-hidden="true">%</span><h3>Chances reais</h3><p>Qual loteria é mais fácil? A matemática de cada uma, sem promessa.</p></a>
      <a class="ferr" href="/boloes/"><span class="ferr-ico" aria-hidden="true">👥</span><h3>Bolões</h3><p>Jogue com mais combinações pagando só uma cota. Veja como funciona.</p></a>
    </div>
  </div>
</section>

${anuncio('home-meio')}

<section class="secao">
  <div class="wrap">
    <div class="secao-topo"><h2>Aprenda antes de jogar</h2><a href="/blog/">Todos os artigos →</a></div>
    <div class="grid-blog">${ARTIGOS.filter((a) => ['como-jogar-na-mega-sena', 'probabilidade-na-loteria-como-calcular', 'como-funciona-o-bolao-da-caixa', 'golpes-da-loteria-como-se-proteger'].includes(a.slug)).map((a) => cardArtigo(a, 'h3')).join('')}</div>
  </div>
</section>

<section class="secao">
  <div class="wrap faq">
    <h2>Perguntas frequentes</h2>
    ${faqHome.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  </div>
</section>
`,
}), { prioridade: '1.0' });

// ---------- RESULTADOS (índice) ----------
salvar('/resultados', layout({
  titulo: 'Resultados das loterias da CAIXA hoje | Pimba',
  descricao: 'Últimos resultados de todas as loterias da CAIXA: Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária, Federal e Loteca.',
  rota: '/resultados/',
  scripts: ['home.js'],
  anuncios: false,
  corpo: `
<section class="secao">
  <div class="wrap">
    ${migalhas([['Início', '/'], ['Resultados', '/resultados/']])}
    <h1>Resultados das loterias</h1>
    <p class="lead">O último concurso de cada modalidade. Clique para ver prêmios por faixa, ganhadores e concursos anteriores.</p>
    <div class="grid-res" id="home-resultados">
      ${LOTERIAS.map((l) => `<article class="card-res esqueleto" style="--cor:${l.cor}"><header><h3><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></h3></header><p class="muted">Carregando…</p></article>`).join('')}
    </div>
  </div>
</section>`,
}), { prioridade: '0.9' });

// ---------- RESULTADOS (uma por loteria) ----------
// v1.7.0: cada página tem texto próprio (conteudo/loterias.mjs), a tabela de quanto custa jogar mais números,
// perguntas frequentes da loteria e a análise do concurso (assets/js/analise.js), tudo no HTML servido.
const NUMERO_UNIVERSO = (l) => l.max - l.min + 1;

/** Tabela "quanto custa jogar mais números", calculada por combinatória (só loterias em que dá para marcar mais). */
function tabelaMaisNumeros(l) {
  if (l.tipo !== 'dezenas' || !l.preco || !(l.escolheMax > l.escolhe)) return '';
  const total = comb(NUMERO_UNIVERSO(l), l.sorteia) * (l.trevos ? comb(6, 2) : 1);
  const ate = Math.min(l.escolheMax, l.escolhe + 6);
  const linhas = [];
  for (let k = l.escolhe; k <= ate; k++) {
    const apostas = comb(k, l.escolhe);
    const chance = total / comb(k, l.sorteia);
    linhas.push(`<tr><td>${k}</td><td>${fmtInt(apostas)}</td><td>${brl(apostas * l.preco)}</td><td>1 em ${fmtInt(Math.round(chance))}</td></tr>`);
  }
  return `<h3>Quanto custa jogar com mais números</h3>
        <p>Cada número a mais no volante faz a aposta valer por várias apostas simples ao mesmo tempo. O preço sobe na mesma proporção que a chance${l.trevos ? ' (com 2 trevos marcados)' : ''}:</p>
        <div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Números</th><th>Apostas</th><th>Preço</th><th>Chance${l.duplo ? " (por sorteio)" : ""}</th></tr></thead><tbody>${linhas.join('')}</tbody></table></div>
        <p class="muted small">Conta feita pelo Pimba: preço da aposta mínima vezes o número de apostas simples equivalentes. ${l.escolheMax > ate ? `Dá para marcar até ${l.escolheMax} números. ` : ''}Bolões costumam usar essas apostas maiores, com o custo dividido entre as cotas.</p>`;
}

for (const l of LOTERIAS) {
  const rota = `/resultados/${l.slug}/`;
  const temConferidor = l.tipo === 'dezenas' || l.tipo === 'colunas';
  const tx = TEXTO_LOTERIA[l.slug];
  const artigo = tx?.artigo && ARTIGOS.find((a) => a.slug === tx.artigo);
  const faq = tx?.faq || [];
  salvar(rota, layout({
    titulo: `Resultado da ${l.nome} — último concurso | Pimba`,
    descricao: `Resultado da ${l.nome} do último concurso com análise dos números, ganhadores e prêmios por faixa. Veja também como jogar, quanto custa e as chances reais.`,
    rota,
    scripts: ['resultado.js'],
    extraHead: faq.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>` : '',
    corpo: `
<section class="secao">
  <div class="wrap layout-2">
    <div>
      ${migalhas([['Início', '/'], ['Resultados', '/resultados/'], [l.nome, rota]])}
      <h1 style="--cor:${l.cor}" class="h1-lot">Resultado da ${esc(l.nome)}<span class="h1-concurso"></span></h1>
      <div id="resultado" class="resultado" data-slug="${l.slug}" aria-live="polite">
        <div class="carregando"><span></span><span></span><span></span> Buscando o resultado…</div>
      </div>
      <div id="analise" data-slug="${l.slug}"></div>
      ${anuncio('resultado')}
      <section class="como-jogar">
        ${tx ? `<h2>Sobre a ${esc(l.nome)}</h2>
        ${tx.sobre.map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
        ${tx.especial ? `<p><strong>Concurso especial:</strong> ${esc(tx.especial)}</p>` : ''}` : ''}
        <h2>Como jogar na ${esc(l.nome)}</h2>
        <p>${esc(l.regra)}</p>
        <ul class="fatos">
          ${l.preco ? `<li><strong>Aposta mínima:</strong> ${brl(l.preco)}</li>` : ''}
          <li><strong>Sorteios:</strong> ${l.sorteios ? `<a href="/calendario/${l.slug}/">${esc(l.dias)}</a> (horário de Brasília)` : esc(l.dias)}</li>
          <li><strong>Onde jogar:</strong> lotéricas e portal/aplicativo Loterias CAIXA</li>
          <li><strong>Prazo para receber:</strong> 90 dias depois do sorteio</li>
        </ul>
        <h3>Chances de ganhar</h3>
        ${tabelaOdds(l)}
        ${tabelaMaisNumeros(l)}
        ${faq.length ? `<h2>Perguntas frequentes sobre a ${esc(l.nome)}</h2>
        <section class="faq">${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>` : ''}
        ${artigo ? `<p>Quer se aprofundar? Leia o guia <a href="/blog/${artigo.slug}/">${esc(artigo.titulo)}</a>.</p>` : `<p>Veja como ela se compara com as outras no <a href="/blog/guia-das-loterias-da-caixa/">guia das loterias da CAIXA</a>.</p>`}
        <p class="muted small">Texto da Equipe Pimba, revisado em ${dataLonga(REVISADO)}. Valores e dias podem mudar; a referência é sempre o site oficial das Loterias CAIXA.</p>
      </section>
    </div>
    <aside class="lateral">
      ${temConferidor ? `<a class="box-acao" style="--cor:${l.cor}" href="/conferidor/?l=${l.slug}"><strong>Conferir meu jogo</strong><span>Marque seus números e veja os acertos</span></a>
      <a class="box-acao box-acao-sec" href="/gerador/?l=${l.slug}"><strong>Gerar números</strong><span>Palpites aleatórios para a ${esc(l.nome)}</span></a>` : ''}
      ${temEstatistica(l) ? `<a class="box-acao box-acao-sec" href="/estatisticas/${l.slug}/"><strong>Estatísticas</strong><span>Números que mais e menos saíram</span></a>` : ''}
      <a class="box-acao box-acao-sec" href="/boloes/"><strong>Jogar em bolão</strong><span>Mais combinações, custo dividido</span></a>
      <div class="box-outras"><h2>Outras loterias</h2>${chips(l.slug)}</div>
    </aside>
  </div>
</section>`,
  }), { prioridade: '0.9' });
}

// ---------- CONFERIDOR ----------
const conferiveis = LOTERIAS.filter((l) => l.tipo === 'dezenas' || l.tipo === 'colunas');
salvar('/conferidor', layout({
  titulo: 'Conferidor de apostas — Mega-Sena, Lotofácil, Quina e mais | Pimba',
  descricao: 'Confira sua aposta grátis: marque os números do seu jogo, escolha o concurso e veja na hora quantos acertou e quanto pagou cada faixa.',
  rota: '/conferidor/',
  scripts: ['conferidor.js'],
  anuncios: false,
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Conferidor', '/conferidor/']])}
    <h1>Conferidor de apostas</h1>
    <p class="lead">Escolha a loteria, marque os números que você jogou e confira. O último concurso já vem selecionado.</p>
    <div class="ferramenta" id="conferidor">
      <fieldset class="seletor-lot"><legend>Loteria</legend>
        ${conferiveis.map((l, i) => `<label class="opt-lot" style="--cor:${l.cor}"><input type="radio" name="lot" value="${l.slug}"${i === 0 ? ' checked' : ''}><span>${esc(l.nome)}</span></label>`).join('')}
      </fieldset>
      <div class="linha-campos">
        <label>Concurso <input type="number" id="conf-concurso" min="1" inputmode="numeric" placeholder="Último"></label>
        <p class="contador" id="conf-contador" aria-live="polite"></p>
      </div>
      <div id="conf-grade" class="grade" role="group" aria-label="Seus números"></div>
      <div id="conf-trevos" class="grade grade-trevos" role="group" aria-label="Seus trevos" hidden></div>
      <div class="acoes">
        <button class="btn btn-primario" id="conf-ok" type="button">Conferir</button>
        <button class="btn btn-sec" id="conf-limpar" type="button">Limpar</button>
      </div>
      <div id="conf-saida" aria-live="polite"></div>
    </div>
    <p class="muted small">O conferidor é uma ajuda. O resultado que vale é o oficial da CAIXA, conferido na lotérica ou no app Loterias CAIXA.</p>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- GERADOR ----------
const geraveis = LOTERIAS.filter((l) => l.tipo === 'dezenas' || l.tipo === 'colunas');
const faqGerador = [
  ['O que são números quentes e frios?', 'Quentes são os números que mais saíram nos últimos concursos. Frios são os que estão há mais tempo sem sair. No modo Quentes ou Frios, o gerador dá mais peso a esses números ao montar seu jogo, usando os resultados oficiais da CAIXA.'],
  ['Jogar nos números quentes ou frios aumenta a chance de ganhar?', 'Não. As bolas não têm memória: em cada sorteio todos os números têm exatamente a mesma chance, não importa o que saiu antes. Os modos são só um jeito divertido de escolher. Qualquer jogo gerado tem a mesma probabilidade de qualquer outro.'],
  ['Para que serve o modo Equilibrado?', 'Ele monta jogos com pares e ímpares na mesma medida e números espalhados por todo o volante, parecidos com a maioria dos resultados. Também não aumenta a chance: um jogo como 1, 2, 3, 4, 5, 6 tem a mesma probabilidade, só é menos comum por existirem poucas combinações assim.'],
  ['O que muda a chance de ganhar, então?', 'Apenas a quantidade de combinações que você joga: marcar mais números no volante ou participar de bolões. Veja a conta exata de cada loteria na página de chances.'],
];
salvar('/gerador', layout({
  titulo: 'Gerador de números para loterias com números quentes e frios | Pimba',
  descricao: 'Gere jogos para Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária: aleatório puro, números quentes, frios ou equilibrado. Grátis e sem cadastro.',
  rota: '/gerador/',
  scripts: ['gerador.js'],
  anuncios: false,
  extraHead: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqGerador.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>`,
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Gerador de números', '/gerador/']])}
    <h1>Gerador de números</h1>
    <p class="lead">Gere seus jogos no aleatório puro ou brinque com as estatísticas: números quentes, frios ou um jogo equilibrado. Sorteio feito com o gerador criptográfico do seu navegador.</p>
    <div class="ferramenta" id="gerador">
      <fieldset class="seletor-lot"><legend>Loteria</legend>
        ${geraveis.map((l, i) => `<label class="opt-lot" style="--cor:${l.cor}"><input type="radio" name="lot" value="${l.slug}"${i === 0 ? ' checked' : ''}><span>${esc(l.nome)}</span></label>`).join('')}
      </fieldset>
      <fieldset class="seletor-lot seletor-modo"><legend>Modo</legend>
        ${MODOS.map((m) => `<label class="opt-lot opt-modo opt-${m.id}"><input type="radio" name="modo" value="${m.id}"${m.id === MODO_PADRAO ? ' checked' : ''}><span>${esc(m.nome)}</span></label>`).join('')}
        <p class="ger-modo-desc muted small" id="ger-modo-desc">${esc(MODOS[0].curto)}</p>
      </fieldset>
      <div class="linha-campos">
        <label>Números por jogo <select id="ger-qtd"></select></label>
        <label>Quantos jogos <select id="ger-jogos">${[1, 2, 3, 4, 5, 10].map((n) => `<option>${n}</option>`).join('')}</select></label>
        <label id="ger-campo-janela" hidden>Com base nos últimos <select id="ger-janela">${JANELAS.map((n) => `<option value="${n}"${n === JANELA_PADRAO ? ' selected' : ''}>${n} concursos</option>`).join('')}</select></label>
      </div>
      <div class="acoes">
        <button class="btn btn-primario" id="ger-ok" type="button">Gerar números</button>
        <button class="btn btn-sec" id="ger-copiar" type="button" hidden>Copiar jogos</button>
      </div>
      <p class="small"><a id="ger-link-est" href="/estatisticas/" hidden>Ver as estatísticas</a></p>
      <div id="ger-saida" aria-live="polite"></div>
    </div>
    <div class="aviso">
      <strong>Sem ilusão:</strong> em cada sorteio todos os números têm exatamente a mesma chance. Quentes, frios ou equilibrado são só formas divertidas de escolher: nenhum gerador, método ou "inteligência artificial" aumenta sua probabilidade de ganhar. <a href="/probabilidades/">Veja as chances reais</a>.
    </div>
    <section class="como-jogar">
      <h2>Os modos do gerador</h2>
      <ul class="lista-check">
        <li><strong>Aleatório puro:</strong> todos os números com o mesmo peso, exatamente como no sorteio da CAIXA.</li>
        <li><strong>Quentes:</strong> dá mais peso aos números que mais saíram nos últimos 10, 25, 50 ou 100 concursos (você escolhe).</li>
        <li><strong>Frios:</strong> dá mais peso aos números que estão há mais tempo sem sair. No Super Sete, aos que menos saíram em cada coluna.</li>
        <li><strong>Equilibrado:</strong> pares e ímpares na mesma medida e números espalhados por todo o volante.</li>
      </ul>
      <p>Quer ver os números antes de jogar? Confira os números que mais saem em cada loteria:</p>
      ${chips('', 'estatisticas', geraveis)}
      <h2>Perguntas frequentes</h2>
      <section class="faq">${faqGerador.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
    </section>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- BOLÕES ----------
const ldLoterica = ldParceiro(SITE.parceiro, SITE.url);

salvar('/boloes', layout({
  titulo: 'Bolão da Mega-Sena, Lotofácil e Quina: como funciona | Pimba',
  descricao: 'Entenda como funciona o bolão oficial das loterias CAIXA: cotas, recibo, tarifa de serviço, onde comprar com segurança e como dividir o prêmio.',
  rota: '/boloes/',
  anuncios: false,
  extraHead: ldLoterica ? `<script type="application/ld+json">${JSON.stringify(ldLoterica)}</script>` : '',
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Bolões', '/boloes/']])}
    <h1>Bolões: jogue mais, pague uma cota</h1>
    <p class="lead">No bolão, várias pessoas dividem o custo de um jogo com mais números. Você paga uma cota e concorre com todas as combinações do bolão. Se ganhar, o prêmio é dividido entre as cotas.</p>
    ${blocoParceiro(SITE.parceiro)}
    <h2>Como funciona o Bolão CAIXA</h2>
    <ul class="lista-check">
      <li>O bolão é montado por uma <strong>lotérica credenciada</strong> e registrado no sistema da CAIXA.</li>
      <li>Cada participante recebe um <strong>recibo de cota oficial</strong>, que é o comprovante para retirar o prêmio.</li>
      <li>A CAIXA define número mínimo e máximo de cotas e valores mínimos por modalidade.</li>
      <li>A lotérica pode cobrar uma <strong>tarifa de serviço</strong> sobre o valor da cota (limitada pelas regras da CAIXA).</li>
      <li>O prêmio é dividido igualmente entre as cotas e cada um saca a sua parte com o próprio recibo.</li>
    </ul>
    <h2>Onde comprar com segurança</h2>
    <ul class="lista-check">
      <li><strong>Na lotérica:</strong> você escolhe o bolão no balcão e leva o recibo na hora.</li>
      <li><strong>Pela internet, no canal oficial:</strong> o portal e o aplicativo Loterias CAIXA vendem cotas de bolões montados pelas lotéricas, com recibo individual.</li>
    </ul>
    <div class="aviso">
      <strong>Cuidado com golpes:</strong> só compre cotas com recibo oficial da CAIXA. Grupos de WhatsApp, perfis e sites que "vendem bolão" por Pix sem esse recibo não garantem o seu prêmio. Rifas e sorteios sem autorização do governo também são ilegais no Brasil.
    </div>
    <h2>Vale a pena?</h2>
    <p>O bolão não muda a matemática: cada combinação continua com a mesma chance. O que ele faz é permitir que você participe de um jogo com mais números (por exemplo, uma Mega-Sena de 9 ou 10 dezenas) pagando uma fração do preço. Em troca, se ganhar, divide o prêmio. É uma boa forma de jogar em grupo — família, trabalho, amigos — gastando pouco.</p>
    <p><a href="/probabilidades/">Veja quanto cada número a mais aumenta suas chances →</a></p>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- PROBABILIDADES ----------
const comparaveis = LOTERIAS.filter((l) => l.preco);
const ordenadas = [...comparaveis].sort((a, b) => a.odds[0][1] - b.odds[0][1]);
salvar('/probabilidades', layout({
  titulo: 'Qual loteria é mais fácil de ganhar? Chances reais de cada uma | Pimba',
  descricao: 'Compare as chances reais de ganhar em cada loteria da CAIXA: Dia de Sorte, Lotofácil, Mega-Sena, Quina, +Milionária e outras. Matemática pura, sem promessa.',
  rota: '/probabilidades/',
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Chances de ganhar', '/probabilidades/']])}
    <h1>Qual loteria é mais fácil de ganhar?</h1>
    <p class="lead">Ranking pela chance de acertar o prêmio principal com a aposta mínima. Quanto menor o número, mais fácil.</p>
    <div class="tabela-rolagem">
    <table class="tabela ranking"><thead><tr><th>#</th><th>Loteria</th><th>Chance do prêmio principal</th><th>Aposta mínima</th></tr></thead><tbody>
      ${ordenadas.map((l, i) => `<tr><td>${i + 1}</td><td><a href="/resultados/${l.slug}/" style="--cor:${l.cor}" class="ponto">${esc(l.nome)}</a></td><td>1 em ${fmtInt(l.odds[0][1])}</td><td>${brl(l.preco)}</td></tr>`).join('')}
    </tbody></table>
    </div>
    <p class="muted small">Loteria Federal: o 1º prêmio sai para 1 bilhete em 100.000 números, mas o preço varia por extração.</p>
    ${anuncio('probabilidades')}
    <h2>O que muda a sua chance (e o que não muda)</h2>
    <ul class="lista-check">
      <li><strong>Muda:</strong> jogar mais combinações. Uma Mega-Sena com 7 números equivale a 7 jogos de 6, e custa 7 vezes mais. Participar de bolões é a forma barata de fazer isso.</li>
      <li><strong>Não muda:</strong> escolher números "atrasados", "quentes", datas, sequências ou palpites de inteligência artificial. Cada sorteio é independente; as bolas não têm memória.</li>
      <li><strong>Dica que ajuda de verdade:</strong> fugir de combinações populares (1-2-3-4-5-6, datas de aniversário) não aumenta a chance de ganhar, mas diminui a chance de dividir o prêmio com muita gente.</li>
    </ul>
    <h2>Chances por faixa em cada loteria</h2>
    ${comparaveis.map((l) => `<details class="det-odds"><summary style="--cor:${l.cor}">${esc(l.nome)}</summary>${tabelaOdds(l)}</details>`).join('')}
  </div>
</section>`,
}), { prioridade: '0.7' });

// ---------- ESTATÍSTICAS ----------
const comEstatistica = LOTERIAS.filter(temEstatistica);
const avisoEstatistica = `<div class="aviso"><strong>Leia antes:</strong> estatística mostra o que já aconteceu, não o que vai acontecer. Cada sorteio é independente e todas as combinações têm exatamente a mesma chance. Número "quente", "frio" ou "atrasado" não aumenta sua probabilidade de ganhar. <a href="/probabilidades/">Veja as chances reais</a>.</div>`;

const faqEstatisticas = [
  ['Jogar nos números mais sorteados aumenta a chance de ganhar?', 'Não. As bolas não têm memória: em cada sorteio, todos os números têm a mesma chance de sair, não importa quantas vezes saíram antes. As diferenças de frequência nos últimos concursos são variação normal do acaso.'],
  ['E os números atrasados, uma hora vão sair?', 'Vão, mas não porque estão "devendo". A chance de um número atrasado sair no próximo concurso é igual à de qualquer outro. A ideia de que ele está para sair é conhecida como falácia do apostador.'],
  ['Então para que servem as estatísticas?', 'Para curiosidade e para escolher seus números de um jeito divertido, sabendo que nenhuma escolha é melhor que outra. A única forma de aumentar a chance é jogar mais combinações, por exemplo em bolões.'],
];
const ldFaqEst = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEstatisticas.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>`;
const blocoFaqEst = `<section class="faq">${faqEstatisticas.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`;

salvar('/estatisticas', layout({
  titulo: 'Estatísticas das loterias: números mais e menos sorteados | Pimba',
  descricao: 'Números que mais saíram, os que menos saíram e os atrasados da Mega-Sena, Lotofácil, Quina e outras loterias nos últimos concursos. Com aviso honesto: estatística não aumenta chance.',
  rota: '/estatisticas/',
  anuncios: false,
  extraHead: ldFaqEst,
  corpo: `
<section class="secao">
  <div class="wrap">
    ${migalhas([['Início', '/'], ['Estatísticas', '/estatisticas/']])}
    <h1>Estatísticas das loterias</h1>
    <p class="lead">Quais números mais saíram, quais menos saíram e quais estão há mais tempo sem aparecer nos últimos 10, 25, 50 ou 100 concursos de cada loteria.</p>
    ${avisoEstatistica}
    <div class="grid-ferr">
      ${comEstatistica.map((l) => `<a class="ferr ferr-lot" style="--cor:${l.cor}" href="/estatisticas/${l.slug}/"><h3>${esc(l.nome)}</h3><p>${l.tipo === 'colunas' ? 'Número mais sorteado em cada coluna' : `Frequência dos ${fmtInt(l.max - l.min + 1)} números${l.trevos ? ' e dos trevos' : l.extra === 'mes' ? ' e dos meses' : l.extra === 'time' ? ' e dos times' : ''}`}</p></a>`).join('')}
    </div>
    <div class="estreito-col">
      <h2>Perguntas frequentes</h2>
      ${blocoFaqEst}
    </div>
  </div>
</section>`,
}), { prioridade: '0.8' });

for (const l of comEstatistica) {
  const rota = `/estatisticas/${l.slug}/`;
  const meta = seoEstatisticas(l);
  salvar(rota, layout({
    titulo: meta.title,
    descricao: meta.description,
    rota,
    scripts: ['estatisticas.js'],
    corpo: `
<section class="secao">
  <div class="wrap layout-2">
    <div>
      ${migalhas([['Início', '/'], ['Estatísticas', '/estatisticas/'], [l.nome, rota]])}
      <h1 style="--cor:${l.cor}" class="h1-lot">Estatísticas da ${esc(l.nome)}</h1>
      ${avisoEstatistica}
      <fieldset class="seletor-lot seletor-janela"><legend>Últimos concursos</legend>
        ${JANELAS.map((n) => `<label class="opt-lot" style="--cor:${l.cor}"><input type="radio" name="janela" value="${n}"${n === JANELA_PADRAO ? ' checked' : ''}><span>${n}</span></label>`).join('')}
      </fieldset>
      <div id="estatisticas" class="resultado" data-slug="${l.slug}" aria-live="polite">
        <div class="carregando"><span></span><span></span><span></span> Calculando as estatísticas…</div>
      </div>
      ${anuncio('estatisticas')}
      <section class="como-jogar">
        <h2>Como ler estas estatísticas</h2>
        <ul class="lista-check">
          ${l.tipo === 'colunas'
            ? '<li><strong>Por coluna:</strong> no Super Sete cada coluna tem seu próprio sorteio de 0 a 9, então a contagem é feita coluna a coluna.</li>'
            : `<li><strong>Mais e menos sorteados:</strong> quantas vezes cada número saiu no período escolhido${l.duplo ? ', somando os dois sorteios de cada concurso' : ''}.</li>
          <li><strong>Há mais tempo sem sair:</strong> quantos concursos se passaram desde a última vez que o número apareceu.</li>`}
          <li><strong>Média esperada:</strong> quantas vezes cada número sairia se tudo fosse perfeitamente igual. Na prática sempre há diferenças, e elas são normais.</li>
        </ul>
        <h2>Perguntas frequentes</h2>
        ${blocoFaqEst}
        <p class="muted small">Calculado a partir dos resultados oficiais das Loterias CAIXA. Confira sempre o resultado oficial.</p>
      </section>
    </div>
    <aside class="lateral">
      <a class="box-acao" style="--cor:${l.cor}" href="/resultados/${l.slug}/"><strong>Último resultado</strong><span>Números, ganhadores e prêmios</span></a>
      <a class="box-acao box-acao-sec" href="/gerador/?l=${l.slug}&amp;modo=quentes"><strong>Gerar com os quentes</strong><span>Jogo com mais peso para os números que mais saíram</span></a>
      <a class="box-acao box-acao-sec" href="/gerador/?l=${l.slug}&amp;modo=frios"><strong>Gerar com os frios</strong><span>Jogo com mais peso para os atrasados</span></a>
      <a class="box-acao box-acao-sec" href="/calendario/${l.slug}/"><strong>Quando é o sorteio</strong><span>${esc(l.dias)}</span></a>
      <div class="box-outras"><h2>Outras estatísticas</h2>${chips(l.slug, 'estatisticas', comEstatistica)}</div>
    </aside>
  </div>
</section>`,
  }), { prioridade: '0.7' });
}

// ---------- CALENDÁRIO ----------
const comCalendario = LOTERIAS.filter((l) => l.sorteios);
const notaCalendario = `<p class="muted small">Horários de Brasília. Desde 19 de julho de 2026 os concursos que eram aos sábados passaram para domingo, às 11h. Em feriados, eleições e concursos especiais (como a Mega da Virada, em 31 de dezembro) a CAIXA pode mudar datas: a data que vale é a divulgada nos canais oficiais.</p>`;

const faqCalendario = [
  ['Que horas são os sorteios das loterias?', 'De segunda a sexta, às 21h (a Loteria Federal às 20h). Aos domingos, às 11h. Sempre no horário de Brasília.'],
  ['Tem sorteio de loteria no sábado?', 'Não há sorteios regulares aos sábados desde 19 de julho de 2026, quando a CAIXA passou os concursos de sábado para domingo de manhã. Em casos excepcionais, como eleições, a CAIXA pode antecipar sorteios para o sábado.'],
  ['Que dia tem sorteio da Mega-Sena?', `A Mega-Sena é sorteada ${POR_SLUG['mega-sena'].dias}.`],
  ['Que dia tem sorteio da Lotofácil?', `A Lotofácil é sorteada ${POR_SLUG.lotofacil.dias}.`],
  ['Até que horas posso apostar?', 'As apostas costumam fechar pouco antes do sorteio, mas o horário exato varia por canal e por concurso. Confira na lotérica ou no aplicativo Loterias CAIXA.'],
];

salvar('/calendario', layout({
  titulo: 'Calendário de sorteios das loterias da CAIXA: dias e horários | Pimba',
  descricao: 'Que dia tem sorteio da Mega-Sena, Lotofácil, Quina e das outras loterias da CAIXA? Veja os dias e horários de cada uma, o que tem hoje e a data do próximo concurso.',
  rota: '/calendario/',
  scripts: ['calendario.js'],
  anuncios: false,
  extraHead: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqCalendario.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>`,
  corpo: `
<section class="secao">
  <div class="wrap">
    ${migalhas([['Início', '/'], ['Calendário de sorteios', '/calendario/']])}
    <div class="cal-topo">
      <div>
        <h1>Calendário de sorteios</h1>
        <p class="lead">Os dias e horários de cada loteria da CAIXA. De segunda a sexta os sorteios são à noite; aos domingos, de manhã.</p>
      </div>
      <aside class="cal-hoje" id="cal-hoje" aria-live="polite"><p class="hd-label">Hoje</p><p class="hd-info">Carregando…</p></aside>
    </div>
    <div class="cal-semana" role="list">
      ${SEMANA.map((d) => {
        const lista = sorteiosDoDia(d);
        return `<section class="cal-dia" data-dia="${d}" role="listitem"><h2><span class="cal-dia-longo">${DIAS[d]}</span><span class="cal-dia-curto" aria-hidden="true">${DIAS_CURTOS[d]}</span></h2>${lista.length
          ? `<ul>${lista.map(({ lot, hora }) => `<li style="--cor:${lot.cor}"><a href="/calendario/${lot.slug}/">${esc(lot.nome)}</a><span>${hora}h</span></li>`).join('')}</ul>`
          : '<p class="muted small">Sem sorteios regulares</p>'}</section>`;
      }).join('')}
    </div>
    ${notaCalendario}
    <h2>Dias, horários e próximo concurso</h2>
    <div class="tabela-rolagem">
    <table class="tabela"><thead><tr><th>Loteria</th><th>Dias e horários</th><th>Próximo concurso</th></tr></thead><tbody>
      ${LOTERIAS.map((l) => `<tr><td><a href="/calendario/${l.slug}/" class="ponto" style="--cor:${l.cor}">${esc(l.nome)}</a></td><td>${esc(l.dias)}</td><td data-proximo="${l.slug}" class="muted">—</td></tr>`).join('')}
    </tbody></table>
    </div>
    <p class="muted small">A Loteca não tem dia fixo: o concurso segue a rodada de futebol da semana.</p>
    <div class="estreito-col">
      <h2>Perguntas frequentes</h2>
      <section class="faq">${faqCalendario.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
    </div>
  </div>
</section>`,
}), { prioridade: '0.8' });

for (const l of comCalendario) {
  const rota = `/calendario/${l.slug}/`;
  const resposta = `A ${l.nome} é sorteada ${l.dias}, no horário de Brasília.`;
  salvar(rota, layout({
    titulo: `Que dia tem sorteio da ${l.nome}? Dias e horários | Pimba`,
    descricao: `${resposta} Veja as próximas datas, a data oficial do próximo concurso e a estimativa de prêmio.`,
    rota,
    scripts: ['calendario.js'],
    anuncios: false,
    extraHead: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `Que dia tem sorteio da ${l.nome}?`, acceptedAnswer: { '@type': 'Answer', text: resposta } }] })}</script>`,
    corpo: `
<section class="secao">
  <div class="wrap layout-2">
    <div>
      ${migalhas([['Início', '/'], ['Calendário', '/calendario/'], [l.nome, rota]])}
      <h1 style="--cor:${l.cor}" class="h1-lot">Quando é o sorteio da ${esc(l.nome)}?</h1>
      <p class="lead">${esc(resposta)}</p>
      <div class="resultado cal-lot" style="--cor:${l.cor}">
        <h2 class="h-sorteio">Dias de sorteio</h2>
        <ul class="cal-mini">${SEMANA.map((d) => {
          const s = l.sorteios.find(([dia]) => dia === d);
          return `<li data-dia="${d}"${s ? ' class="tem"' : ''}><span>${DIAS_CURTOS[d]}</span><b>${s ? `${s[1]}h` : '—'}</b></li>`;
        }).join('')}</ul>
        <h2 class="h-sorteio">Próximo concurso (data oficial)</h2>
        <p data-proximo="${l.slug}" class="muted">Consultando a CAIXA…</p>
        <h2 class="h-sorteio">Próximas datas pela grade</h2>
        <ol class="cal-proximos" id="cal-proximos" data-slug="${l.slug}"><li class="muted">${esc(l.dias)}</li></ol>
      </div>
      ${notaCalendario}
      <section class="como-jogar">
        <h2>Como jogar na ${esc(l.nome)}</h2>
        <p>${esc(l.regra)}</p>
        <ul class="fatos">
          ${l.preco ? `<li><strong>Aposta mínima:</strong> ${brl(l.preco)}</li>` : ''}
          <li><strong>Onde jogar:</strong> lotéricas e portal/aplicativo Loterias CAIXA</li>
          <li><strong>Onde ver o sorteio:</strong> ao vivo nos canais oficiais da CAIXA; o resultado aparece no Pimba minutos depois</li>
        </ul>
      </section>
    </div>
    <aside class="lateral">
      <a class="box-acao" style="--cor:${l.cor}" href="/resultados/${l.slug}/"><strong>Último resultado</strong><span>Números, ganhadores e prêmios</span></a>
      ${temEstatistica(l) ? `<a class="box-acao box-acao-sec" href="/estatisticas/${l.slug}/"><strong>Estatísticas</strong><span>Números que mais e menos saíram</span></a>` : ''}
      ${temEstatistica(l) ? `<a class="box-acao box-acao-sec" href="/conferidor/?l=${l.slug}"><strong>Conferir meu jogo</strong><span>Marque seus números e veja os acertos</span></a>` : ''}
      <div class="box-outras"><h2>Outras loterias</h2>${chips(l.slug, 'calendario', comCalendario)}</div>
    </aside>
  </div>
</section>`,
  }), { prioridade: '0.7' });
}

// ---------- BLOG ----------
const ultimaData = ARTIGOS.map((a) => a.atualizado || a.data).sort().at(-1);
salvar('/blog', layout({
  titulo: 'Blog do Pimba: guias, chances e dicas sobre as loterias da CAIXA',
  descricao: 'Artigos para jogar sabendo o que está fazendo: como jogar em cada loteria, como calcular as chances, como funciona o bolão, como receber o prêmio e como fugir de golpes.',
  rota: '/blog/',
  anuncios: false,
  extraHead: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog do Pimba', url: `${SITE.url}/blog/`, inLanguage: 'pt-BR', blogPost: ARTIGOS.map((a) => ({ '@type': 'BlogPosting', headline: a.titulo, url: `${SITE.url}/blog/${a.slug}/`, datePublished: a.data })) })}</script>`,
  corpo: `
<section class="secao">
  <div class="wrap">
    ${migalhas([['Início', '/'], ['Blog', '/blog/']])}
    <h1>Blog do Pimba</h1>
    <p class="lead">Guias diretos e honestos sobre as loterias da CAIXA: como jogar, quanto custa, quais são as chances reais e como jogar com segurança. Sem promessa de prêmio.</p>
    ${CATEGORIAS.map((cat) => {
      const lista = ARTIGOS.filter((a) => a.categoria === cat);
      return lista.length ? `<h2>${esc(cat)}</h2><div class="grid-blog">${lista.map((a) => cardArtigo(a, 'h3')).join('')}</div>` : '';
    }).join('\n')}
  </div>
</section>`,
}), { prioridade: '0.7', lastmod: ultimaData });

for (const a of ARTIGOS) {
  const rota = `/blog/${a.slug}/`;
  const rel = relacionados(a, ARTIGOS);
  salvar(rota, layout({
    titulo: `${a.titulo} | Pimba`,
    descricao: a.descricao,
    rota,
    ogTipo: 'article',
    extraHead: `<meta property="article:published_time" content="${a.data}"><meta property="article:modified_time" content="${a.atualizado || a.data}"><meta property="article:section" content="${esc(a.categoria)}"><script type="application/ld+json">${JSON.stringify(ldArtigo(a, SITE))}</script>`,
    corpo: `
<article class="secao">
  <div class="wrap estreito texto artigo">
    ${migalhas([['Início', '/'], ['Blog', '/blog/'], [a.titulo, rota]])}
    <p class="card-blog-cat">${esc(a.categoria)}</p>
    <h1>${esc(a.titulo)}</h1>
    <p class="artigo-meta">Por <a href="/sobre/">Equipe Pimba</a> · <time datetime="${a.data}">${dataLonga(a.data)}</time>${a.atualizado ? ` · atualizado em <time datetime="${a.atualizado}">${dataLonga(a.atualizado)}</time>` : ''} · ${a.leitura} min de leitura</p>
    ${a.html}
    <div class="aviso"><strong>Jogue com responsabilidade.</strong> Loteria é diversão, não investimento. Nenhum método aumenta a chance de ganhar, e apostas são proibidas para menores de 18 anos. O Pimba não é a CAIXA e não vende apostas. <a href="/jogo-responsavel/">Saiba mais</a>.</div>
    ${anuncio('artigo')}
    <section class="leia-tambem">
      <h2>Leia também</h2>
      <div class="grid-blog">${rel.map((b) => cardArtigo(b, 'h3')).join('')}</div>
    </section>
  </div>
</article>`,
  }), { prioridade: '0.6', lastmod: a.atualizado || a.data });
}

// ---------- PÁGINAS INSTITUCIONAIS ----------
const pagTexto = (rota, titulo, descricao, h1, html, extraHead = '') =>
  salvar(rota, layout({
    titulo: `${titulo} | Pimba`, descricao, rota: `${rota}/`, extraHead, anuncios: false,
    corpo: `<section class="secao"><div class="wrap estreito texto">${migalhas([['Início', '/'], [h1, `${rota}/`]])}<h1>${esc(h1)}</h1>${html}</div></section>`,
  }), { prioridade: '0.3' });

const emailLink = SITE.email ? `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>` : '';

pagTexto('/sobre', 'Sobre o Pimba', 'Quem faz o Pimba, de onde vêm os resultados, como o site se mantém e os nossos princípios: informação honesta sobre as loterias da CAIXA, sem promessa de prêmio.', 'Sobre o Pimba', `
<p>O Pimba (pimba.com.br) é um site brasileiro e independente sobre as loterias da CAIXA. Nasceu para ser o jeito mais rápido de saber se você ganhou: resultado na tela minutos depois do sorteio, conferidor fácil e informação honesta sobre as chances de cada loteria.</p>
<h2>O que você encontra aqui</h2>
<ul class="lista-check">
  <li><strong><a href="/resultados/">Resultados</a></strong> das 11 loterias da CAIXA, com premiação por faixa, ganhadores e concursos anteriores.</li>
  <li><strong>Ferramentas grátis:</strong> <a href="/conferidor/">conferidor de apostas</a>, <a href="/gerador/">gerador de números</a>, <a href="/estatisticas/">estatísticas</a>, <a href="/calendario/">calendário de sorteios</a> e <a href="/probabilidades/">chances de ganhar</a>.</li>
  <li><strong><a href="/blog/">Blog</a></strong> com guias sobre como jogar em cada modalidade, probabilidade, bolões, como receber prêmios e como evitar golpes.</li>
</ul>
<h2>De onde vêm os resultados</h2>
<p>Os resultados são obtidos automaticamente dos canais oficiais das Loterias CAIXA, logo após a divulgação de cada sorteio. As probabilidades são calculadas por combinatória e conferem com as publicadas pela CAIXA. Mesmo assim, erros e atrasos podem acontecer: <strong>o resultado que vale é sempre o oficial da CAIXA</strong>, conferido na lotérica ou no aplicativo Loterias CAIXA.</p>
<h2>Nossos princípios</h2>
<ul class="lista-check">
  <li><strong>Sem promessa de prêmio.</strong> Nenhuma ferramenta, estatística ou método aumenta a chance de ganhar, e dizemos isso em todas as páginas em que o assunto aparece.</li>
  <li><strong>Independência.</strong> O Pimba não é a CAIXA, não vende apostas nem cotas de bolão e não recebe dinheiro de apostas.</li>
  <li><strong>Jogo responsável.</strong> Loteria é diversão para maiores de 18 anos. Veja a nossa página de <a href="/jogo-responsavel/">jogo responsável</a>.</li>
  <li><strong>Correção rápida.</strong> Encontrou um erro num resultado ou num texto? Avise pela página de <a href="/contato/">contato</a> e corrigimos.</li>
</ul>
<h2>Quem escreve</h2>
<p>Os textos do blog são escritos e revisados pela Equipe Pimba, com base nas regras oficiais publicadas pela CAIXA e em cálculos que qualquer pessoa pode refazer. Quando uma regra, preço ou calendário muda, atualizamos as páginas e indicamos a data da atualização.</p>
<h2>Como o Pimba se mantém</h2>
<p>O site é gratuito e se mantém com anúncios exibidos pelo Google AdSense. Os anúncios são identificados como "Publicidade" e aparecem só nas páginas de conteúdo (resultados, estatísticas, chances e artigos), nunca nas ferramentas, nas páginas institucionais ou na página de bolões. Saiba como os anúncios usam cookies na <a href="/privacidade/">política de privacidade e cookies</a>.</p>
<p>O Pimba também divulga os bolões oficiais de uma lotérica parceira credenciada pela CAIXA, a ${esc(SITE.parceiro?.nome || 'lotérica parceira')}. A compra das cotas acontece sempre no canal oficial da CAIXA ou na própria lotérica, com recibo oficial. Veja a página de <a href="/boloes/">bolões</a>.</p>
<h2>Fale com a gente</h2>
<p>Dúvidas, sugestões, correções ou parcerias: ${emailLink ? `escreva para ${emailLink} ou ` : ''}veja a página de <a href="/contato/">contato</a>.</p>`,
`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Pimba', url: SITE.url, logo: `${SITE.url}/assets/img/app/icon-512.png`, ...(SITE.email ? { email: SITE.email } : {}) })}</script>`);

pagTexto('/contato', 'Contato', 'Fale com o Pimba: correções de resultados, dúvidas sobre o site, privacidade, anúncios e parcerias.', 'Fale com o Pimba', `
<p>Quer avisar sobre um erro, tirar uma dúvida sobre o site ou propor uma parceria? Fale com a gente.</p>
${emailLink ? `<div class="contato-box"><p class="contato-rotulo">E-mail</p><p class="contato-email">${emailLink}</p><p class="muted small">Respondemos em até 2 dias úteis.</p></div>` : ''}
${parceiroAtivo(SITE.parceiro) && SITE.parceiro.whatsapp ? `<p data-fora-do-app>WhatsApp: <a href="${zap(SITE.parceiro.whatsapp, 'Olá! Vim pelo site do Pimba.')}" target="_blank" rel="noopener">fale com a gente</a></p>` : ''}
<h2>Para agilizar</h2>
<ul class="lista-check">
  <li><strong>Erro em resultado:</strong> diga a loteria, o número do concurso e o que está diferente do resultado oficial.</li>
  <li><strong>Privacidade e dados pessoais (LGPD):</strong> diga qual direito quer exercer (acesso, correção, exclusão etc.). Veja a <a href="/privacidade/">política de privacidade</a>.</li>
  <li><strong>Anúncios:</strong> se algum anúncio parecer impróprio, conte em que página ele apareceu e o que ele mostrava.</li>
</ul>
<h2>O que não fazemos</h2>
<p>O Pimba não é a CAIXA e não tem acesso a apostas, bilhetes ou prêmios. Não vendemos apostas nem cotas de bolão e <strong>nunca entramos em contato pedindo pagamento, senha ou dados bancários</strong>. Para prêmios, apostas feitas no aplicativo ou problemas com bilhetes, procure uma lotérica ou o atendimento oficial das Loterias CAIXA.</p>
<p>Para bolões, fale direto com a lotérica parceira pelos contatos da página <a href="/boloes/">bolões</a>.</p>`);

pagTexto('/jogo-responsavel', 'Jogo responsável', 'Loteria é diversão. Veja como jogar com responsabilidade e onde buscar ajuda.', 'Jogo responsável', `
<p>Loteria é entretenimento, não investimento nem fonte de renda. As chances de ganhar o prêmio principal são muito pequenas — na Mega-Sena, 1 em 50 milhões por aposta simples.</p>
<ul class="lista-check">
  <li>Apostas são proibidas para menores de 18 anos.</li>
  <li>Defina um valor por mês que não faça falta e não passe dele.</li>
  <li>Nunca jogue para recuperar dinheiro perdido ou pagar dívidas.</li>
  <li>Desconfie de qualquer promessa de "método garantido".</li>
  <li>Se o jogo está tirando seu sono, seu dinheiro ou sua paz, peça ajuda. O CVV atende 24h pelo 188, e o SUS oferece apoio nos CAPS.</li>
</ul>`);

const contatoPriv = SITE.email
  ? `pelo e-mail <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a> ou pela página de <a href="/contato/">contato</a>`
  : 'pela página de <a href="/contato/">contato</a>';
pagTexto('/privacidade', 'Política de privacidade e cookies', 'Como o Pimba trata seus dados e usa cookies (Google AdSense e Analytics), conforme a LGPD.', 'Política de privacidade e cookies', `
<p>Última atualização: 24/11/2026 (versão ${V}).</p>
<p>Esta política explica quais dados o Pimba (pimba.com.br) trata, para quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, LGPD).</p>
<h2>Quem é o responsável</h2>
<p>O controlador dos dados é o Pimba, site independente de informação sobre loterias. Fale com a gente sobre privacidade ${contatoPriv}.</p>
<h2>O que coletamos</h2>
<ul class="lista-check">
  <li><strong>Nada de cadastro.</strong> O Pimba não pede nome, CPF nem senha.</li>
  <li><strong>Seus números ficam com você.</strong> O que você digita no conferidor e no gerador fica só no seu navegador e não é enviado a nós.</li>
  <li><strong>Dados técnicos de acesso</strong> (endereço IP, navegador, páginas visitadas, data e hora), registrados pela nossa hospedagem (Cloudflare) para segurança e funcionamento do site.</li>
  <li><strong>Cookies e identificadores de terceiros</strong>, descritos abaixo.</li>
</ul>
<h2>Anúncios (Google AdSense)</h2>
<p>O Pimba é gratuito e se mantém com anúncios exibidos pelo Google AdSense. Sobre esses anúncios:</p>
<ul class="lista-check">
  <li>Fornecedores terceiros, incluindo o Google, usam cookies para veicular anúncios com base nas suas visitas anteriores a este e a outros sites.</li>
  <li>Com os cookies de publicidade, o Google e seus parceiros podem mostrar anúncios com base nas suas visitas ao Pimba e a outros sites da internet.</li>
  <li>Você pode desativar a publicidade personalizada nas <a href="https://adssettings.google.com" rel="noopener" target="_blank">Configurações de anúncios do Google</a>. Também pode desativar cookies de outros fornecedores de publicidade personalizada em <a href="https://www.aboutads.info/choices/" rel="noopener" target="_blank">aboutads.info</a>.</li>
  <li>Veja como o Google usa os dados dos sites parceiros em <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR" rel="noopener" target="_blank">policies.google.com/technologies/partner-sites</a>.</li>
  <li>Os anúncios são do Google e de anunciantes. O Pimba não escolhe cada anúncio, não vende apostas e não tem relação com os anunciantes. Os anúncios aparecem só nas páginas de conteúdo, nunca nas ferramentas nem na página de bolões.</li>
</ul>
<h2>Estatísticas de visitas (Google Analytics)</h2>
<p>Se ativado, o Google Analytics conta visitas e páginas mais vistas de forma agregada, para sabermos o que melhorar. Você pode bloqueá-lo com o <a href="https://tools.google.com/dlpage/gaoptout?hl=pt-BR" rel="noopener" target="_blank">complemento de desativação do Google Analytics</a>.</p>
<h2>Como controlar os cookies</h2>
<p>Você pode apagar ou bloquear cookies nas configurações do seu navegador (Chrome, Safari, Firefox, Edge) ou navegar em janela anônima. O site continua funcionando sem cookies; os anúncios só deixam de ser personalizados.</p>
<h2>Para que usamos os dados e com qual base legal</h2>
<ul class="lista-check">
  <li><strong>Funcionamento e segurança do site</strong> (registros técnicos): legítimo interesse.</li>
  <li><strong>Anúncios e estatísticas de visitas</strong> (cookies de terceiros): legítimo interesse e, quando exigido, o seu consentimento, que você controla pelo navegador e pelas configurações do Google.</li>
  <li><strong>Lista de avisos por WhatsApp ou e-mail</strong>: o seu consentimento, ao entrar na lista.</li>
</ul>
<h2>Contatos por WhatsApp</h2>
<p>Se você entrar na nossa lista ou falar conosco pelo WhatsApp, seu número é usado apenas para enviar o que você pediu. Você pode sair a qualquer momento.</p>
<h2>Compartilhamento e transferência internacional</h2>
<p>Não vendemos dados pessoais. Os dados técnicos e os cookies são tratados pelos fornecedores citados (Google e Cloudflare), que podem processá-los fora do Brasil, com as garantias previstas na LGPD.</p>
<h2>Por quanto tempo guardamos</h2>
<p>Registros técnicos são guardados pelo tempo necessário à segurança do site. Os cookies de terceiros seguem os prazos de cada fornecedor e podem ser apagados por você a qualquer momento.</p>
<h2>Seus direitos (LGPD)</h2>
<p>Você pode pedir confirmação de que tratamos seus dados, acesso, correção, exclusão, informação sobre compartilhamento e revogação do consentimento ${contatoPriv}. Também pode reclamar à Autoridade Nacional de Proteção de Dados (<a href="https://www.gov.br/anpd" rel="noopener" target="_blank">ANPD</a>).</p>
<h2>Menores de idade</h2>
<p>Apostas em loterias são proibidas para menores de 18 anos. O Pimba não é direcionado a crianças e adolescentes.</p>
<h2>Mudanças nesta política</h2>
<p>Quando esta política mudar, atualizamos a data no topo da página.</p>`);

pagTexto('/termos', 'Termos de uso', 'Termos de uso do Pimba: natureza informativa do site, resultados, ferramentas, anúncios, links externos, propriedade intelectual e responsabilidades.', 'Termos de uso', `
<p>Última atualização: 24/11/2026.</p>
<p>Estes termos valem para o uso do site pimba.com.br e do aplicativo Pimba. Ao usar o Pimba você concorda com eles. Se não concordar, por favor não use o site.</p>
<h2>1. O que é o Pimba</h2>
<p>O Pimba é um site independente de informação sobre as loterias da CAIXA. <strong>Não é a CAIXA, não vende apostas, não intermedeia jogos e não recebe valores de apostas.</strong> Apostas e cotas de bolão oficiais são vendidas somente nas lotéricas credenciadas e nos canais oficiais da CAIXA.</p>
<h2>2. Resultados e informações</h2>
<ul class="lista-check">
  <li>Os resultados são obtidos de fontes oficiais e exibidos de forma automática, mas podem conter atrasos ou erros. <strong>O resultado válido é sempre o oficial da CAIXA.</strong> Confira na lotérica ou no aplicativo Loterias CAIXA antes de descartar qualquer bilhete.</li>
  <li>Preços, regras, dias de sorteio e probabilidades são informados de boa-fé e atualizados quando a CAIXA os altera, mas a referência é sempre o regulamento oficial.</li>
  <li>Os textos do blog são informativos e não são aconselhamento financeiro, jurídico ou tributário.</li>
</ul>
<h2>3. Ferramentas</h2>
<ul class="lista-check">
  <li>O conferidor é uma ajuda e não substitui a conferência oficial.</li>
  <li>O gerador de números e as estatísticas são recursos de entretenimento. <strong>Nenhum deles aumenta a chance de ganhar</strong>: em cada sorteio, todas as combinações têm a mesma probabilidade.</li>
  <li>Os números que você digita nas ferramentas ficam no seu navegador.</li>
</ul>
<h2>4. Idade mínima</h2>
<p>Apostas em loterias são proibidas para menores de 18 anos. O conteúdo do Pimba é destinado a maiores de idade.</p>
<h2>5. Anúncios e links externos</h2>
<ul class="lista-check">
  <li>O site exibe anúncios do Google AdSense, identificados como "Publicidade". Os anunciantes são responsáveis pelos seus anúncios e ofertas; o Pimba não endossa produtos anunciados.</li>
  <li>O Pimba tem links para sites de terceiros, como o portal da CAIXA e a lotérica parceira. Não controlamos esses sites e não respondemos pelo conteúdo, pelas políticas ou pelas transações feitas neles.</li>
</ul>
<h2>6. Propriedade intelectual</h2>
<p>Os textos, o código, o visual e a marca Pimba pertencem ao Pimba. Você pode compartilhar links e citar pequenos trechos com a indicação da fonte, mas não pode copiar o site ou partes substanciais dele sem autorização. Os nomes e marcas das loterias pertencem aos seus titulares e são citados apenas para identificação.</p>
<h2>7. Uso adequado</h2>
<p>Não é permitido usar o Pimba para atividades ilegais, tentar sobrecarregar ou invadir o site, ou coletar o conteúdo de forma automatizada em volume que prejudique o serviço.</p>
<h2>8. Responsabilidade</h2>
<p>O Pimba é oferecido gratuitamente, "como está". Não nos responsabilizamos por decisões tomadas com base nas informações do site, por apostas, por perdas ou por prêmios não recebidos. A conferência oficial e a guarda do bilhete são responsabilidade do apostador.</p>
<h2>9. Privacidade</h2>
<p>O tratamento de dados pessoais e o uso de cookies estão descritos na <a href="/privacidade/">política de privacidade e cookies</a>.</p>
<h2>10. Mudanças e legislação</h2>
<p>Estes termos podem ser atualizados, e a data no topo da página indica a versão em vigor. Eles são regidos pelas leis da República Federativa do Brasil.</p>
<h2>11. Contato</h2>
<p>Dúvidas sobre estes termos: ${emailLink || 'veja a página de <a href="/contato/">contato</a>'}.</p>`);

// ---------- 404 ----------
salvar('/404', layout({
  titulo: 'Página não encontrada | Pimba', descricao: 'Página não encontrada.', rota: '/404', robots: 'noindex',
  corpo: `<section class="secao"><div class="wrap estreito centro"><p class="numero-404">404</p><h1>Essa não saiu</h1><p class="lead">A página que você procurou não existe (ou mudou de lugar com a reforma do site).</p><div class="acoes centro"><a class="btn btn-primario" href="/resultados/">Ver resultados</a><a class="btn btn-sec" href="/">Ir para o início</a></div>${chips()}</div></section>`,
}), { sitemap: false });

// ---------- OFFLINE (usada pelo service worker do app) ----------
salvar('/offline', layout({
  titulo: 'Sem conexão | Pimba', descricao: 'Você está sem internet.', rota: '/offline/', robots: 'noindex',
  corpo: `<section class="secao"><div class="wrap estreito centro"><p class="numero-404">ops</p><h1>Você está sem internet</h1><p class="lead">Resultados e estatísticas só aparecem com conexão, para você nunca ver um número velho achando que é o último. Assim que a internet voltar, é só tentar de novo.</p><div class="acoes centro"><a class="btn btn-primario" href="">Tentar de novo</a><a class="btn btn-sec" href="/conferidor/">Abrir o conferidor</a></div></div></section>`,
}), { sitemap: false });

// ---------- arquivos de apoio ----------
const hoje = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map((pg) => `  <url><loc>${SITE.url}${pg.rota === '/' ? '/' : `${pg.rota.replace(/\/$/, '')}/`}</loc><lastmod>${pg.lastmod || hoje}</lastmod><priority>${pg.prioridade}</priority></url>`).join('\n')}
</urlset>
`);

writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`);

if (adsenseAtivo(SITE)) {
  writeFileSync(join(DIST, 'ads.txt'), adsTxt(SITE));
}

// Redirecionamentos do WordPress/WooCommerce antigo
writeFileSync(join(DIST, '_redirects'), `/shop / 301
/shop/* / 301
/loja / 301
/loja/* / 301
/cart / 301
/carrinho / 301
/checkout / 301
/finalizar-compra / 301
/my-account / 301
/minha-conta / 301
/minha-conta/* / 301
/produto/* / 301
/product/* / 301
/categoria-produto/* / 301
/product-category/* / 301
/cursos / 301
/cursos/* / 301
/curso/* / 301
/feed / 301
/wp-login.php / 301
/wp-admin / 301
/wp-admin/* / 301
/resultados /resultados/ 301
/estatisticas /estatisticas/ 301
/calendario /calendario/ 301
/conferidor /conferidor/ 301
/gerador /gerador/ 301
/blog /blog/ 301
/contato /contato/ 301
`);

writeFileSync(join(DIST, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN

/assets/*
  Cache-Control: public, max-age=3600

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache
  Service-Worker-Allowed: /

/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=3600
`);

// PWA / app Android
writeFileSync(join(DIST, 'manifest.webmanifest'), `${JSON.stringify(manifesto(SITE), null, 2)}\n`);
writeFileSync(join(DIST, 'sw.js'), serviceWorker(V));
// /.well-known/assetlinks.json é servido pelo Worker a partir de SITE.app.sha256 (veja worker/index.js)

writeFileSync(join(DIST, 'version.txt'), `Pimba v${V}\n`);
console.log(`Pimba v${V}: ${paginas.length} páginas geradas em dist/`);
