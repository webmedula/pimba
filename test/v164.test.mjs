// Pimba v1.6.4 — testes: o Worker usa o servicebus3 (o mesmo do site da CAIXA) e cai no servicebus2 se ele falhar (node --test)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './mock-caixa.mjs';

const guardado = new Map();
globalThis.caches = {
  default: {
    match: async (req) => (guardado.has(req.url) ? new Response(guardado.get(req.url)) : undefined),
    put: async (req, resp) => { guardado.set(req.url, await resp.text()); },
  },
};
const ULTIMO = { megasena: 2950, lotofacil: 3540, quina: 6890, lotomania: 2820, timemania: 2300, duplasena: 2850, diadesorte: 1130, supersete: 760, maismilionaria: 300, federal: 6010, loteca: 1210 };
let hosts = [];
let foraNo = new Set(); // "host|api" que respondem 500
globalThis.fetch = async (url) => {
  const u = new URL(String(url));
  const api = u.pathname.split('/api/')[1].split('/')[0];
  hosts.push(`${u.hostname}|${api}`);
  if (foraNo.has(`${u.hostname}|${api}`)) return new Response('{"message":"Ocorreu um erro inesperado."}', { status: 500 });
  return new Response(JSON.stringify(fixture(api, ULTIMO[api])));
};
const { default: worker } = await import('../worker/index.js');
const pedir = async (rota, env = {}) => {
  const espera = [];
  const resp = await worker.fetch(new Request(`https://pimba.com.br${rota}`), { ASSETS: { fetch: async () => new Response('') }, ...env }, { waitUntil: (p) => espera.push(p) });
  await Promise.all(espera);
  return resp;
};

beforeEach(() => { guardado.clear(); hosts = []; foraNo = new Set(); });

test('busca primeiro no servicebus3, o mesmo servidor do site oficial', async () => {
  const d = await (await pedir('/api/resultado/super-sete')).json();
  assert.equal(d.concurso, 760);
  assert.deepEqual(hosts, ['servicebus3.caixa.gov.br|supersete']);
});

test('Super Sete com erro 500 no servicebus3: tenta o servicebus2 e mostra o resultado', { timeout: 10000 }, async () => {
  foraNo = new Set(['servicebus3.caixa.gov.br|supersete']);
  const d = await (await pedir('/api/resultado/super-sete')).json();
  assert.equal(d.concurso, 760);
  assert.ok(!d.desatualizado);
  assert.deepEqual(hosts, ['servicebus3.caixa.gov.br|supersete', 'servicebus2.caixa.gov.br|supersete']);
});

test('como em 26/11/2026: servicebus2 fora só para a Super Sete não afeta nada', async () => {
  foraNo = new Set(['servicebus2.caixa.gov.br|supersete']);
  const d = await (await pedir('/api/resultados')).json();
  assert.equal(d['super-sete'].concurso, 760);
  assert.ok(Object.values(d).every((r) => r && !r.desatualizado));
});

test('concurso antigo também tenta o outro servidor', { timeout: 10000 }, async () => {
  foraNo = new Set(['servicebus3.caixa.gov.br|supersete']);
  const r = await pedir('/api/resultado/super-sete/700');
  assert.equal(r.status, 200);
});

test('CAIXA_API_BASE (dados falsos em desenvolvimento) continua valendo sozinho', async () => {
  await pedir('/api/resultado/quina', { CAIXA_API_BASE: 'http://127.0.0.1:8788/api' });
  assert.deepEqual(hosts, ['127.0.0.1|quina']);
});
