// Pimba v1.7.0 — testes da revisão do AdSense: conteúdo próprio por loteria, análise do concurso e páginas sem anúncio (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { comb, hiper, pct, renderAnalise } from '../assets/js/analise.js';
import { TEXTO_LOTERIA } from '../conteudo/loterias.mjs';
import { ARTIGOS } from '../conteudo/blog/index.mjs';

execFileSync(process.execPath, ['scripts/build.mjs'], { stdio: 'ignore' });
const ler = (rota) => readFileSync(`dist${rota}index.html`, 'utf8');
const temAdsense = (html) => html.includes('adsbygoogle.js');
const semTags = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const resultado = (slug, extra = {}) => ({
  slug, concurso: 2950, data: '26/11/2026', dezenas: [], dezenas2: [], trevos: [], jogos: [], premios: [],
  ganhadoresLocais: [], acumulado: false, proximo: { concurso: 2951, data: '', estimativa: null }, ...extra,
});

test('combinatória confere com as chances publicadas', () => {
  assert.equal(comb(60, 6), 50063860);
  assert.equal(comb(25, 15), 3268760);
  assert.equal(comb(80, 5), 24040016);
  let soma = 0;
  for (let k = 0; k <= 6; k++) soma += hiper(60, 30, 6, k);
  assert.ok(Math.abs(soma - 1) < 1e-9);
  assert.equal(pct(0.3289), '33%');
  assert.equal(pct(0.0005), '0,05%');
  assert.equal(pct(0.9999), 'mais de 99%');
});

test('análise da Mega-Sena: pares, metades, soma, sequências, repetidos e atraso', () => {
  const lot = POR_SLUG['mega-sena'];
  const hist = [
    { c: 2949, n: ['05', '26', '43', '50', '51', '60'] },
    ...Array.from({ length: 20 }, (_, i) => ({ c: 2948 - i, n: ['01', '02', '03', '04', i === 5 ? '17' : '06', '07'] })),
  ];
  const r = resultado('mega-sena', {
    dezenas: ['10', '11', '12', '17', '26', '43'],
    premios: [
      { descricao: '6 acertos', ganhadores: 0, valor: 0 },
      { descricao: '5 acertos', ganhadores: 40, valor: 50000 },
      { descricao: '4 acertos', ganhadores: 3000, valor: 1000 },
    ],
    acumulado: true, proximo: { concurso: 2951, data: '', estimativa: 85000000 },
  });
  const t = semTags(renderAnalise(r, lot, hist));
  assert.match(t, /Análise do concurso 2\.950/);
  assert.match(t, /3 números pares e 3 ímpares/);
  assert.match(t, /Houve 1 sequência de números seguidos: 10 a 12/);
  assert.match(t, /2 números repetiram do concurso 2\.949: 26 e 43/);
  assert.match(t, /O número mais "atrasado" do resultado era o 10|10, 11 e 12 não apareciam/);
  assert.match(t, /Ninguém acertou a faixa principal \(6 acertos\) e o prêmio acumulou/);
  assert.match(t, /3\.040 apostas foram premiadas/);
  assert.match(t, /não indica números para o próximo/);
  // nenhuma promessa de ganho
  assert.doesNotMatch(t, /aumenta(m)? (a|sua) chance de ganhar/i);
});

test('análise: uma aposta ganhadora no singular, com o valor em vezes a aposta mínima', () => {
  const lot = POR_SLUG['dia-de-sorte'];
  const r = resultado('dia-de-sorte', {
    dezenas: ['01', '05', '09', '14', '20', '27', '31'],
    premios: [{ descricao: '7 acertos', ganhadores: 1, valor: 450000 }],
  });
  const t = semTags(renderAnalise(r, lot));
  assert.match(t, /saiu para 1 aposta, com R\$\s?450\.000,00, ou 180\.000 vezes/);
  assert.doesNotMatch(t, /para cada uma/);
});

test('análise do Super Sete, da Loteca e da Dupla Sena; nada para resultado parcial', () => {
  const s7 = semTags(renderAnalise(resultado('super-sete', { dezenas: ['1', '2', '3', '4', '5', '6', '7'] }), POR_SLUG['super-sete'], [{ c: 2949, n: ['1', '0', '0', '0', '0', '0', '7'] }]));
  assert.match(s7, /todos diferentes/);
  assert.match(s7, /2 colunas repetiram o número do concurso 2\.949 \(colunas 1 e 7\)/);
  const jogos = [[2, 0], [1, 1], [0, 3], [5, 1]].map(([m, v], i) => ({ n: i + 1, mandante: `A${i}`, visitante: `B${i}`, golsM: m, golsV: v }));
  const lt = semTags(renderAnalise(resultado('loteca', { jogos }), POR_SLUG.loteca));
  assert.match(lt, /2 vitórias do mandante, 1 empate e 1 vitória do visitante/);
  assert.match(lt, /A3 5 × 1 B3/);
  const ds = semTags(renderAnalise(resultado('dupla-sena', { dezenas: ['01', '02', '10', '20', '30', '40'], dezenas2: ['02', '03', '11', '21', '31', '41'] }), POR_SLUG['dupla-sena']));
  assert.match(ds, /No 2º sorteio, 1 número coincidiu com o 1º: 02/);
  assert.equal(renderAnalise({ ...resultado('mega-sena', { dezenas: ['01'] }), parcial: true }, POR_SLUG['mega-sena']), '');
});

test('cada loteria tem texto próprio, sem parágrafo repetido entre páginas', () => {
  const vistos = new Map();
  for (const l of LOTERIAS) {
    const tx = TEXTO_LOTERIA[l.slug];
    assert.ok(tx, `sem texto: ${l.slug}`);
    assert.ok(tx.sobre.length >= 3 && tx.faq.length >= 3, l.slug);
    const palavras = tx.sobre.join(' ').split(/\s+/).length;
    assert.ok(palavras >= 110, `${l.slug}: só ${palavras} palavras`);
    if (tx.artigo) assert.ok(ARTIGOS.some((a) => a.slug === tx.artigo), `artigo inexistente: ${tx.artigo}`);
    for (const p of tx.sobre) {
      assert.ok(!vistos.has(p), `parágrafo repetido em ${l.slug} e ${vistos.get(p)}`);
      vistos.set(p, l.slug);
    }
  }
});

test('página de resultado já sai com texto próprio, FAQ, tabela de mais números e lugar para a análise', () => {
  for (const l of LOTERIAS) {
    const html = ler(`/resultados/${l.slug}/`);
    assert.ok(html.includes(`<h2>Sobre a ${l.nome}</h2>`), l.slug);
    assert.ok(html.includes('"@type":"FAQPage"'), l.slug);
    assert.ok(html.includes('<div id="analise"'), l.slug);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>')).replace(/<script[\s\S]*?<\/script>/g, '');
    assert.ok(semTags(main).split(' ').length > 320, `${l.slug}: pouco texto no HTML`);
  }
  const mega = semTags(ler('/resultados/mega-sena/'));
  assert.match(mega, /7 7 R\$\s?42,00 1 em 7\.151\.980/);
  assert.match(semTags(ler('/resultados/lotofacil/')), /16 16 R\$\s?56,00 1 em 204\.298/);
  assert.match(semTags(ler('/resultados/mais-milionaria/')), /com 2 trevos marcados/);
  assert.ok(!ler('/resultados/lotomania/').includes('Quanto custa jogar com mais números'));
});

test('anúncio só nas páginas de conteúdo; ferramentas, navegação e institucionais sem o script do AdSense', () => {
  const com = ['/', '/resultados/mega-sena/', '/resultados/federal/', '/estatisticas/quina/', '/probabilidades/', `/blog/${ARTIGOS[0].slug}/`];
  const sem = ['/resultados/', '/conferidor/', '/gerador/', '/boloes/', '/calendario/', '/calendario/mega-sena/', '/estatisticas/', '/blog/',
    '/sobre/', '/contato/', '/privacidade/', '/termos/', '/jogo-responsavel/', '/offline/'];
  for (const r of com) assert.ok(temAdsense(ler(r)), `deveria ter anúncio: ${r}`);
  for (const r of sem) assert.ok(!temAdsense(ler(r)), `não deveria ter anúncio: ${r}`);
  assert.ok(!temAdsense(readFileSync('dist/404.html', 'utf8')));
  assert.ok(readFileSync('dist/ads.txt', 'utf8').startsWith('google.com, pub-'));
});

test('Worker: concurso antigo vira noindex e sem anúncio; home passa pelo Worker', () => {
  const w = readFileSync('worker/index.js', 'utf8');
  assert.match(w, /if \(n\) \{\s*rw = semAnuncio\(rw\.on\('meta\[name="robots"\]', \{ element: \(el\) => el\.setAttribute\('content', 'noindex,follow'\)/);
  assert.match(w, /script\[src\*="adsbygoogle"\]/);
  assert.match(w, /url\.pathname === '\/' \|\| url\.pathname === '\/resultados\/'/);
  const cfg = readFileSync('wrangler.jsonc', 'utf8');
  assert.match(cfg, /"run_worker_first": \["\/",/);
});
