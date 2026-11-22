// Pimba v1.5.0 — testes dos modos do gerador: Aleatório puro, Quentes, Frios e Equilibrado (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LOTERIAS, POR_SLUG } from '../assets/js/loterias.js';
import { normalizar } from '../assets/js/render.js';
import { calcularEstatisticas, compactar } from '../assets/js/stats.js';
import {
  MODOS, avisoModo, colunasEquilibradas, equilibrado, escolherExtras, jogoColunas, jogoDezenas, modoValido, pesosDezenas, sortearComPeso,
} from '../assets/js/modos.js';
import { fixture } from './mock-caixa.mjs';

const hist = (l, de, ate) => {
  const out = [];
  for (let c = de; c <= ate; c++) out.push(compactar(normalizar(fixture(l.api, c), l)));
  return out;
};
const estDe = (slug) => { const l = POR_SLUG[slug]; return calcularEstatisticas(hist(l, 2851, 2950), l, 50); };
const geraveis = LOTERIAS.filter((l) => l.tipo === 'dezenas');

test('modos: quatro modos, ?modo= inválido cai no aleatório', () => {
  assert.deepEqual(MODOS.map((m) => m.id), ['aleatorio', 'quentes', 'frios', 'equilibrado']);
  assert.equal(modoValido('quentes'), 'quentes');
  assert.equal(modoValido('<script>'), 'aleatorio');
  assert.equal(modoValido(null), 'aleatorio');
});

test('todo modo gera jogo válido em toda loteria de dezenas (quantidade, faixa, sem repetir)', () => {
  for (const l of geraveis) {
    const est = calcularEstatisticas(hist(l, 2851, 2950), l, 50);
    for (const { id } of MODOS) {
      for (const qtd of [l.escolhe, l.escolheMax]) {
        const nums = jogoDezenas(id, l, qtd, est);
        assert.equal(nums.length, qtd, `${l.slug}/${id}/${qtd}`);
        assert.equal(new Set(nums).size, qtd, `${l.slug}/${id}: repetido`);
        assert.ok(nums.every((n) => Number.isInteger(n) && n >= l.min && n <= l.max), `${l.slug}/${id}: fora da faixa`);
        assert.deepEqual(nums, [...nums].sort((a, b) => a - b));
      }
    }
  }
});

test('quentes favorece os mais sorteados e frios os mais atrasados (sem excluir ninguém)', () => {
  const l = POR_SLUG['mega-sena'];
  const est = estDe('mega-sena');
  const top = new Set([...est.numeros].sort((a, b) => b.freq - a.freq).slice(0, 15).map((x) => x.n));
  const atr = (x) => (x.atraso === null ? est.concursos : x.atraso);
  const velhos = new Set([...est.numeros].sort((a, b) => atr(b) - atr(a)).slice(0, 15).map((x) => x.n));
  const conta = (modo, alvo) => {
    let dentro = 0;
    for (let i = 0; i < 400; i++) dentro += jogoDezenas(modo, l, 6, est).filter((n) => alvo.has(n)).length;
    return dentro / (400 * 6);
  };
  // No aleatório, 15 de 60 números = 25% das bolas. Os modos precisam puxar bem acima disso.
  assert.ok(conta('quentes', top) > 0.4, 'quentes não favoreceu os mais sorteados');
  assert.ok(conta('frios', velhos) > 0.4, 'frios não favoreceu os atrasados');
  assert.ok(conta('aleatorio', top) < 0.35, 'aleatório não deveria favorecer');
  const pesos = pesosDezenas('quentes', est);
  assert.ok(Math.min(...pesos) >= 1, 'todo número precisa continuar possível');
});

test('sortearComPeso respeita os pesos e não repete', () => {
  let seq = 0;
  const rand = () => { seq = (seq * 9301 + 49297) % 233280; return seq / 233280; };
  const r = sortearComPeso(['a', 'b', 'c', 'd'], [0, 0, 0, 1], 1, rand);
  assert.deepEqual(r, ['d']);
  const todos = sortearComPeso([1, 2, 3, 4, 5], [1, 1, 1, 1, 1], 5, rand);
  assert.deepEqual([...todos].sort(), [1, 2, 3, 4, 5]);
});

test('equilibrado: pares/ímpares perto da metade e números em todas as faixas', () => {
  for (const l of geraveis) {
    for (let i = 0; i < 30; i++) {
      const nums = jogoDezenas('equilibrado', l, l.escolhe, null);
      assert.ok(equilibrado(nums, l), `${l.slug}: ${nums.join(',')}`);
    }
  }
  assert.equal(equilibrado([1, 2, 3, 4, 5, 6], POR_SLUG['mega-sena']), false);
  assert.equal(equilibrado([2, 4, 6, 8, 10, 12], POR_SLUG['mega-sena']), false);
});

test('Super Sete: 7 dígitos 0-9 em todos os modos; equilibrado tem 3 ou 4 pares', () => {
  const est = estDe('super-sete');
  for (const { id } of MODOS) {
    const d = jogoColunas(id, est);
    assert.equal(d.length, 7);
    assert.ok(d.every((x) => Number.isInteger(x) && x >= 0 && x <= 9), id);
  }
  for (let i = 0; i < 30; i++) assert.ok(colunasEquilibradas(jogoColunas('equilibrado', null)));
});

test('extras: trevos e meses distintos, e quentes/frios usam a estatística dos extras', () => {
  const nomes = [1, 2, 3, 4, 5, 6].map((n) => `Trevo ${n}`);
  const t = escolherExtras('quentes', estDe('mais-milionaria'), nomes, 2);
  assert.equal(new Set(t).size, 2);
  const est = { extras: { itens: [{ nome: 'MARÇO', freq: 30 }] } };
  const meses = ['Janeiro', 'Março'];
  let marco = 0;
  for (let i = 0; i < 200; i++) if (escolherExtras('quentes', est, meses, 1)[0] === 'Março') marco++;
  assert.ok(marco > 140, 'mês quente deveria sair bem mais (comparação sem caixa)');
});

test('sem estatística, quentes/frios não quebram (caem no aleatório)', () => {
  const l = POR_SLUG.quina;
  assert.equal(jogoDezenas('quentes', l, 5, null).length, 5);
  assert.equal(jogoColunas('frios', null).length, 7);
});

test('todo aviso dos modos com estatística diz que a chance não muda; nenhum promete mais chance', () => {
  for (const { id } of MODOS) {
    const txt = avisoModo(id, { concursos: 50 });
    if (id !== 'aleatorio') assert.match(txt, /não muda sua chance/);
    assert.doesNotMatch(txt, /aumenta(r)? (a|sua) chance|mais chance|maior probabilidade/i);
  }
  assert.match(avisoModo('quentes', { concursos: 50 }), /últimos 50 concursos/);
  assert.match(avisoModo('frios', { concursos: 50 }, POR_SLUG['super-sete']), /menos saíram em cada coluna/);
});

test('build: gerador com os 4 modos, FAQ e aviso; estatísticas levam ao gerador com quentes/frios', () => {
  if (!existsSync(new URL('../dist/gerador/index.html', import.meta.url))) execFileSync('node', ['scripts/build.mjs'], { cwd: new URL('..', import.meta.url) });
  const ger = readFileSync(new URL('../dist/gerador/index.html', import.meta.url), 'utf8');
  for (const m of ['aleatorio', 'quentes', 'frios', 'equilibrado']) assert.match(ger, new RegExp(`name="modo" value="${m}"`));
  assert.match(ger, /id="ger-janela"/);
  assert.match(ger, /"@type":"FAQPage"/);
  assert.match(ger, /números quentes e frios/);
  assert.match(ger, /Sem ilusão/);
  const est = readFileSync(new URL('../dist/estatisticas/mega-sena/index.html', import.meta.url), 'utf8');
  assert.match(est, /\/gerador\/\?l=mega-sena&amp;modo=quentes/);
  assert.match(est, /\/gerador\/\?l=mega-sena&amp;modo=frios/);
  assert.match(est, /<title>Números que mais saem na Mega-Sena/);
});
