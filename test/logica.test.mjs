// Pimba — testes da lógica (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { normalizar, renderResultado, renderCard, seo } from '../assets/js/render.js';
import { conferir, interpretarFaixa } from '../assets/js/conferir.js';
import { fixture } from './mock-caixa.mjs';

test('normaliza e renderiza todas as loterias sem erro', () => {
  for (const l of LOTERIAS) {
    const r = normalizar(fixture(l.api, 100), l);
    assert.equal(r.concurso, 100);
    assert.ok(renderResultado(r, l).includes('Concurso'));
    assert.ok(renderCard(r, l).includes(l.nome));
    assert.ok(seo(r, l).title.includes(String(r.concurso)));
  }
});

test('rejeita resposta inválida', () => {
  assert.throws(() => normalizar({}, POR_SLUG['mega-sena']));
  assert.throws(() => normalizar('<html>', POR_SLUG['mega-sena']));
});

test('interpreta descrições de faixa', () => {
  assert.deepEqual(interpretarFaixa('6 acertos'), { acertos: 6, sorteio: 0, trevos: null });
  assert.equal(interpretarFaixa('Quadra').acertos, 4);
  assert.equal(interpretarFaixa('5 acertos - 2º sorteio').sorteio, 2);
  assert.deepEqual(interpretarFaixa('6 acertos + 1 ou nenhum trevo').trevos.sort(), [0, 1]);
  assert.deepEqual(interpretarFaixa('3 acertos + 2 trevos').trevos, [2]);
  assert.equal(interpretarFaixa('Time do Coração').acertos, null);
});

test('confere Mega-Sena', () => {
  const l = POR_SLUG['mega-sena'];
  const r = normalizar(fixture(l.api, 2950), l);
  const sorteadas = r.dezenas.map(Number);
  const jogo = [...sorteadas.slice(0, 4), 99, 98];
  const c = conferir(jogo, [], r, l);
  assert.equal(c.acertos, 4);
  assert.equal(r.premios[c.faixas[0]].descricao, '4 acertos');
});

test('confere Dupla Sena por sorteio', () => {
  const l = POR_SLUG['dupla-sena'];
  const r = normalizar(fixture(l.api, 2850), l);
  const jogo = r.dezenas2.map(Number).slice(0, 5).concat([-1]);
  const c = conferir(jogo, [], r, l);
  assert.equal(c.acertos2, 5);
  assert.ok(c.faixas.some((i) => r.premios[i].descricao === '5 acertos - 2º sorteio'));
});

test('confere +Milionária com trevos', () => {
  const l = POR_SLUG['mais-milionaria'];
  const r = normalizar(fixture(l.api, 300), l);
  const jogo = r.dezenas.map(Number).slice(0, 3).concat([-1, -2, -3]);
  const c = conferir(jogo, r.trevos.map(Number), r, l);
  assert.equal(c.acertos, 3);
  assert.equal(c.trevos, 2);
  assert.deepEqual(c.faixas.map((i) => r.premios[i].descricao), ['3 acertos + 2 trevos']);
  const c2 = conferir(r.dezenas.map(Number), [], r, l);
  assert.deepEqual(c2.faixas.map((i) => r.premios[i].descricao), ['6 acertos + 1 ou nenhum trevo']);
});

test('confere Super Sete por coluna', () => {
  const l = POR_SLUG['super-sete'];
  const r = normalizar(fixture(l.api, 760), l);
  const jogo = r.dezenas.map(Number);
  jogo[0] = (jogo[0] + 1) % 10;
  jogo[1] = (jogo[1] + 1) % 10;
  const c = conferir(jogo, [], r, l);
  assert.equal(c.acertos, 5);
  assert.equal(r.premios[c.faixas[0]].descricao, '5 acertos');
});

test('escapa HTML vindo da API', () => {
  const l = POR_SLUG.loteca;
  const raw = fixture(l.api, 10);
  raw.listaResultadoEquipeEsportiva[0].nomeEquipeUm = '<script>x</script>';
  const html = renderResultado(normalizar(raw, l), l);
  assert.ok(!html.includes('<script>x'));
});
