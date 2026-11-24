// Pimba v1.6.0 — testes do blog e das páginas institucionais (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ARTIGOS, CATEGORIAS } from '../conteudo/blog/index.mjs';
import { dataLonga, ldArtigo, relacionados } from '../scripts/blog.mjs';
import { SITE } from '../src/config.js';

execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'ignore' });
const ler = (rota) => readFileSync(`dist${rota}index.html`, 'utf8');
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');

test('blog: pelo menos 12 artigos, slugs únicos, categoria válida, data ISO', () => {
  assert.ok(ARTIGOS.length >= 12, `só ${ARTIGOS.length} artigos`);
  assert.equal(new Set(ARTIGOS.map((a) => a.slug)).size, ARTIGOS.length);
  for (const a of ARTIGOS) {
    assert.match(a.slug, /^[a-z0-9-]+$/);
    assert.ok(CATEGORIAS.includes(a.categoria), a.slug);
    assert.match(a.data, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(a.titulo.length <= 70, `título longo: ${a.slug}`);
    assert.ok(a.descricao.length >= 110 && a.descricao.length <= 180, `descrição fora do tamanho: ${a.slug}`);
  }
});

test('blog: artigos com conteúdo de verdade (mínimo de 400 palavras) e sem "undefined"/"NaN"', () => {
  for (const a of ARTIGOS) {
    assert.ok(a.palavras >= 400, `${a.slug}: ${a.palavras} palavras`);
    assert.ok(!/undefined|NaN|\[object/.test(a.html), a.slug);
  }
});

test('blog: nenhuma promessa de ganho', () => {
  const proibido = /(aumente|aumenta|aumentar) (muito )?(suas|sua|as) chances? de ganhar(?! na mesma)|ganho garantido|(?<!romessa de )prêmio garantido(?!s)|método infalível|números que vão sair(?!")/i;
  for (const a of ARTIGOS) assert.ok(!proibido.test(a.html.replace(/"[^"]*"/g, '')), a.slug);
});

test('blog: índice, página de cada artigo, sitemap e dados estruturados', () => {
  const idx = ler('/blog/');
  for (const a of ARTIGOS) {
    const rota = `/blog/${a.slug}/`;
    assert.ok(idx.includes(`href="${rota}"`), `índice sem ${a.slug}`);
    assert.ok(sitemap.includes(`<loc>${SITE.url}${rota}</loc>`), `sitemap sem ${a.slug}`);
    const html = ler(rota);
    assert.ok(html.includes('"@type":"BlogPosting"'));
    assert.ok(html.includes('<meta name="robots" content="index,follow">'));
    assert.ok(html.includes('Jogue com responsabilidade.'));
    assert.ok(html.includes('Leia também'));
  }
  assert.ok(sitemap.includes(`<loc>${SITE.url}/blog/</loc>`));
});

test('blog: todo link interno dos artigos aponta para uma página que existe', () => {
  for (const a of ARTIGOS) {
    for (const [, href] of a.html.matchAll(/href="(\/[^"#?]*)/g)) {
      assert.ok(existsSync(`dist${href}index.html`) || existsSync(`dist${href}`), `${a.slug} → ${href}`);
    }
    assert.ok(/href="\/(resultados|conferidor|gerador|estatisticas|calendario|probabilidades|boloes|jogo-responsavel)\//.test(a.html) || /href="\/blog\//.test(a.html), `${a.slug} sem link interno`);
  }
});

test('blog: utilidades', () => {
  assert.equal(dataLonga('2026-11-24'), '24 de novembro de 2026');
  const a = ARTIGOS[0];
  const ld = ldArtigo(a, SITE);
  assert.equal(ld.url, `${SITE.url}/blog/${a.slug}/`);
  assert.equal(ld.datePublished, a.data);
  const rel = relacionados(a, ARTIGOS);
  assert.equal(rel.length, 3);
  assert.ok(!rel.includes(a));
});

test('institucionais: Sobre, Contato, Privacidade e Termos existem, estão no sitemap e no rodapé de toda página', () => {
  const rotas = ['/sobre/', '/contato/', '/privacidade/', '/termos/', '/jogo-responsavel/', '/blog/'];
  for (const r of rotas) assert.ok(sitemap.includes(`<loc>${SITE.url}${r}</loc>`), r);
  for (const pg of ['/', '/blog/', `/blog/${ARTIGOS[0].slug}/`, '/conferidor/', '/resultados/mega-sena/']) {
    const html = ler(pg);
    for (const r of rotas) assert.ok(html.includes(`<a href="${r}">`), `${pg} sem link para ${r}`);
  }
});

test('contato: e-mail configurado aparece em Contato, Sobre, Privacidade e Termos', () => {
  assert.match(SITE.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/);
  for (const r of ['/contato/', '/sobre/', '/privacidade/', '/termos/']) assert.ok(ler(r).includes(`mailto:${SITE.email}`), r);
});

test('privacidade menciona cookies, AdSense, Google e LGPD; termos cobrem anúncios e responsabilidade', () => {
  const priv = ler('/privacidade/');
  for (const t of ['cookies', 'Google AdSense', 'adssettings.google.com', 'policies.google.com/technologies/partner-sites', 'LGPD']) assert.ok(priv.includes(t), t);
  const termos = ler('/termos/');
  for (const t of ['Publicidade', 'Propriedade intelectual', 'Responsabilidade', 'não vende apostas']) assert.ok(termos.includes(t), t);
});

test('robots.txt libera o site e aponta o sitemap; só 404 e offline têm noindex', () => {
  const robots = readFileSync('dist/robots.txt', 'utf8');
  assert.match(robots, /Allow: \//);
  assert.ok(!/Disallow: \/\s*$/m.test(robots));
  assert.ok(robots.includes(`Sitemap: ${SITE.url}/sitemap.xml`));
  for (const [, loc] of sitemap.matchAll(/<loc>https:\/\/pimba\.com\.br([^<]*)<\/loc>/g)) {
    assert.ok(!ler(loc).includes('noindex'), `noindex em ${loc}`);
  }
});
