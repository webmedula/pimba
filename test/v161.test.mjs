// Pimba v1.6.1 — testes: home não fica sem resultado quando a CAIXA falha, e sem "Time:" vazio (node --test)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { normalizar, renderCard, renderResultado, extraDe, limparExtra } from '../assets/js/render.js';
import { fixture } from './mock-caixa.mjs';

// ---- Cache API e fetch falsos, para rodar o Worker no Node ----
const guardado = new Map();
globalThis.caches = {
  default: {
    match: async (req) => (guardado.has(req.url) ? new Response(guardado.get(req.url)) : undefined),
    put: async (req, resp) => { guardado.set(req.url, await resp.text()); },
  },
};
let caixaFora = new Set();
let pedidos = [];
let simultaneos = 0;
let picoSimultaneos = 0;
const ULTIMO = { megasena: 2950, lotofacil: 3540, quina: 6890, lotomania: 2820, timemania: 2300, duplasena: 2850, diadesorte: 1130, supersete: 760, maismilionaria: 300, federal: 6010, loteca: 1210 };
globalThis.fetch = async (url) => {
  const api = String(url).split('/api/')[1].split('/')[0];
  pedidos.push(api);
  simultaneos++;
  picoSimultaneos = Math.max(picoSimultaneos, simultaneos);
  await new Promise((ok) => setTimeout(ok, 2));
  simultaneos--;
  if (caixaFora.has(api)) return new Response('bloqueado', { status: 403 });
  const raw = fixture(api, ULTIMO[api]);
  if (api === 'lotofacil') raw.nomeTimeCoracaoMesSorte = '\u0000'.repeat(20); // como a CAIXA manda de verdade
  return new Response(JSON.stringify(raw));
};
const { default: worker } = await import('../worker/index.js');
const env = { ASSETS: { fetch: async () => new Response('') } };
const pedir = async (rota) => {
  const espera = [];
  const resp = await worker.fetch(new Request(`https://pimba.com.br${rota}`), env, { waitUntil: (p) => espera.push(p) });
  await Promise.all(espera);
  return resp;
};
const esperarRetentativa = { timeout: 20000 };

beforeEach(() => { caixaFora = new Set(); pedidos = []; picoSimultaneos = 0; });

test('"Time:" vazio: caracteres invisíveis da CAIXA são removidos e só Timemania/Dia de Sorte mostram o extra', () => {
  assert.equal(limparExtra('\u0000\u0000\u0000  '), '');
  assert.equal(limparExtra(' FLAMENGO/RJ \u0000'), 'FLAMENGO/RJ');
  const lf = POR_SLUG.lotofacil;
  const raw = { ...fixture('lotofacil', 3540), nomeTimeCoracaoMesSorte: '\u0000'.repeat(20) };
  const r = normalizar(raw, lf);
  assert.equal(r.timeMes, '');
  assert.ok(!renderCard(r, lf).includes('Time:'));
  // dado antigo, já salvo no cache com o lixo: também não aparece
  assert.equal(extraDe({ timeMes: '\u0000\u0000' }, lf), '');
  assert.ok(!renderCard({ ...r, timeMes: '\u0000\u0000' }, lf).includes('Time:'));
  assert.ok(!renderResultado({ ...r, timeMes: '\u0000\u0000' }, lf).includes('Time do Coração'));
  const tm = POR_SLUG.timemania;
  const rt = normalizar({ ...fixture('timemania', 2300), nomeTimeCoracaoMesSorte: 'FLAMENGO/RJ' }, tm);
  assert.ok(renderCard(rt, tm).includes('Time: FLAMENGO/RJ'));
});

test('/api/resultados traz as 11 loterias sem disparar 11 pedidos de uma vez na CAIXA', async () => {
  guardado.clear();
  const d = await (await pedir('/api/resultados')).json();
  for (const l of LOTERIAS) assert.ok(d[l.slug]?.concurso, l.slug);
  assert.ok(picoSimultaneos <= 4, `pico de ${picoSimultaneos} pedidos simultâneos`);
  assert.equal(d.lotofacil.timeMes, '');
});

test('CAIXA falhou: devolve a última cópia boa em vez de "indisponível", e não deixa o navegador guardar', esperarRetentativa, async () => {
  guardado.clear();
  await pedir('/api/resultados'); // enche o cache
  // envelhece todas as entradas para forçar nova consulta
  for (const [k, v] of guardado) { const o = JSON.parse(v); if (o.em) { o.em -= 10 * 60 * 1000; guardado.set(k, JSON.stringify(o)); } }
  caixaFora = new Set(['megasena', 'quina']);
  pedidos = [];
  const resp = await pedir('/api/resultados');
  const d = await resp.json();
  assert.equal(d['mega-sena'].concurso, 2950);
  assert.equal(d['mega-sena'].desatualizado, true);
  assert.equal(d.quina.desatualizado, true);
  assert.ok(!d.lotofacil.desatualizado);
  assert.equal(resp.headers.get('Cache-Control'), 'no-store');
  // tentou de novo antes de desistir
  assert.equal(pedidos.filter((a) => a === 'megasena').length, 2);
});

test('cache fresco: nenhum pedido à CAIXA; resposta completa pode ficar 60 s no navegador', async () => {
  guardado.clear();
  await pedir('/api/resultados');
  pedidos = [];
  const resp = await pedir('/api/resultados');
  assert.equal(pedidos.length, 0);
  assert.equal(resp.headers.get('Cache-Control'), 'public, max-age=60');
});

test('sem cópia guardada e CAIXA fora: só aquela loteria vem vazia, e a página da loteria responde 502', esperarRetentativa, async () => {
  guardado.clear();
  caixaFora = new Set(['quina']);
  const d = await (await pedir('/api/resultados')).json();
  assert.equal(d.quina, null);
  assert.ok(d['mega-sena'].concurso);
  assert.equal((await pedir('/api/resultado/quina')).status, 502);
});

test('home busca sozinha cada loteria que faltou e o "Tentar de novo" não sai da página', () => {
  const js = readFileSync(new URL('../assets/js/home.js', import.meta.url), 'utf8');
  assert.ok(js.includes('/api/resultado/${slug}'));
  assert.ok(js.includes('data-tentar'));
  assert.ok(renderCard(null, POR_SLUG.quina).includes('data-tentar="quina"'));
});
