// Pimba v1.6.3 — testes: Super Sete (ou qualquer loteria) com a API da CAIXA fora não vira "indisponível" (node --test)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POR_SLUG } from '../assets/js/loterias.js';
import { normalizar, renderCard, renderResultado } from '../assets/js/render.js';
import { compactar, expandir } from '../assets/js/stats.js';
import { fixture } from './mock-caixa.mjs';

const guardado = new Map();
globalThis.caches = {
  default: {
    match: async (req) => (guardado.has(req.url) ? new Response(guardado.get(req.url)) : undefined),
    put: async (req, resp) => { guardado.set(req.url, await resp.text()); },
  },
};
const ULTIMO = { megasena: 2950, lotofacil: 3540, quina: 6890, lotomania: 2820, timemania: 2300, duplasena: 2850, diadesorte: 1130, supersete: 760, maismilionaria: 300, federal: 6010, loteca: 1210 };
let caixaFora = new Set();
let sinais = [];
globalThis.fetch = async (url, opts = {}) => {
  sinais.push(opts.signal);
  const api = String(url).split('/api/')[1].split('/')[0];
  if (caixaFora.has(api)) throw new TypeError('fetch failed'); // como a API da Super Sete em 26/11/2026
  return new Response(JSON.stringify(fixture(api, ULTIMO[api])));
};
const { default: worker } = await import('../worker/index.js');
const env = { ASSETS: { fetch: async () => new Response('') } };
const pedir = async (rota) => {
  const espera = [];
  const resp = await worker.fetch(new Request(`https://pimba.com.br${rota}`), env, { waitUntil: (p) => espera.push(p) });
  await Promise.all(espera);
  return resp;
};
const lento = { timeout: 20000 };
const ss = POR_SLUG['super-sete'];

beforeEach(() => { guardado.clear(); caixaFora = new Set(); sinais = []; });

test('todo pedido à CAIXA tem tempo máximo (uma loteria travada não segura a fila da home)', async () => {
  await pedir('/api/resultado/super-sete');
  assert.ok(sinais.length > 0 && sinais.every((s) => s instanceof AbortSignal));
});

test('Super Sete fora e sem cópia guardada: usa o concurso mais novo do histórico das estatísticas', lento, async () => {
  const hist = [757, 760, 758].map((c) => compactar(normalizar(fixture('supersete', c), ss)));
  guardado.set('https://cache.pimba/hist/supersete', JSON.stringify(hist));
  caixaFora = new Set(['supersete']);
  const d = await (await pedir('/api/resultados')).json();
  assert.equal(d['super-sete'].concurso, 760);
  assert.equal(d['super-sete'].dezenas.length, 7);
  assert.equal(d['super-sete'].desatualizado, true);
  assert.ok(d['mega-sena'].concurso && !d['mega-sena'].desatualizado);
  const resp = await pedir('/api/resultado/super-sete');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('Cache-Control'), 'no-store');
});

test('sem histórico nenhum: continua vazio (o card mostra o aviso), e as outras loterias seguem normais', lento, async () => {
  caixaFora = new Set(['supersete']);
  const d = await (await pedir('/api/resultados')).json();
  assert.equal(d['super-sete'], null);
  assert.ok(d.quina.concurso);
});

test('cópia boa do último concurso fica guardada 30 dias', async () => {
  const js = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8');
  assert.match(js, /const TTL_RESERVA = 60 \* 60 \* 24 \* 30;/);
});

test('cards e página: aviso de resultado não confirmado, premiação ausente e link para a CAIXA', () => {
  const r = expandir(compactar(normalizar(fixture('supersete', 760), ss)), ss);
  const card = renderCard(r, ss);
  assert.ok(card.includes('Concurso 760'));
  assert.ok(card.includes('aviso-mini'));
  const pag = renderResultado(r, ss);
  assert.ok(pag.includes('pode já haver um concurso mais novo'));
  assert.ok(pag.includes('premiação deste concurso não está disponível'));
  const vazio = renderCard(null, ss);
  assert.ok(vazio.includes('data-tentar="super-sete"'));
  assert.ok(vazio.includes('loterias.caixa.gov.br'));
  assert.ok(!vazio.includes('Resultado indisponível'));
  // resultado normal não leva aviso
  assert.ok(!renderCard(normalizar(fixture('supersete', 760), ss), ss).includes('aviso-mini'));
});

test('"Tentar de novo" que falha fica na home em vez de abrir a página da loteria', () => {
  const js = readFileSync(new URL('../assets/js/home.js', import.meta.url), 'utf8');
  assert.ok(!js.includes('location.href = link.href'));
  assert.ok(js.includes('Ainda sem resposta'));
});
