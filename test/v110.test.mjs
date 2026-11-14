// Pimba v1.1.0 — testes das estatísticas e do calendário (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOTERIAS, POR_SLUG, descreverDias } from '../assets/js/loterias.js';
import { normalizar } from '../assets/js/render.js';
import { calcularEstatisticas, compactar, janelaValida, renderEstatisticas, temEstatistica, JANELA_PADRAO } from '../assets/js/stats.js';
import { agoraBrasilia, proximosSorteios, sorteiosDoDia, rotuloDia } from '../assets/js/datas.js';
import { fixture } from './mock-caixa.mjs';

const hist = (l, de, ate) => {
  const out = [];
  for (let c = de; c <= ate; c++) out.push(compactar(normalizar(fixture(l.api, c), l)));
  return out;
};

test('estatísticas: frequência, atraso e ranking batem com a contagem manual', () => {
  const l = POR_SLUG['mega-sena'];
  const h = hist(l, 2901, 2950);
  const est = calcularEstatisticas(h, l, 25);
  assert.equal(est.concursos, 25);
  assert.equal(est.de, 2926);
  assert.equal(est.ate, 2950);
  const usados = h.filter((x) => x.c > 2925);
  for (const { n, freq, atraso } of est.numeros) {
    assert.equal(freq, usados.filter((x) => x.n.map(Number).includes(n)).length);
    const ultimo = usados.filter((x) => x.n.map(Number).includes(n)).map((x) => x.c).sort((a, b) => b - a)[0];
    assert.equal(atraso, ultimo === undefined ? null : 2950 - ultimo);
  }
  assert.equal(est.numeros.reduce((s, x) => s + x.freq, 0), 25 * 6);
  assert.ok(est.mais[0].freq >= est.mais[9].freq);
  assert.ok(est.menos[0].freq <= est.menos[9].freq);
  assert.equal(est.esperado, (25 * 6) / 60);
  // os números que saíram no último concurso têm atraso 0
  for (const d of usados.at(-1).n.map(Number)) assert.equal(est.numeros.find((x) => x.n === d).atraso, 0);
});

test('estatísticas: Dupla Sena soma os dois sorteios, +Milionária conta trevos, Dia de Sorte conta meses', () => {
  const ds = POR_SLUG['dupla-sena'];
  const e1 = calcularEstatisticas(hist(ds, 2841, 2850), ds, 10);
  const totalDs = hist(ds, 2841, 2850).reduce((s, x) => s + new Set([...x.n, ...x.n2].map(Number)).size, 0);
  assert.equal(e1.numeros.reduce((s, x) => s + x.freq, 0), totalDs);
  assert.equal(e1.esperado, (10 * 2 * 6) / 50);

  const mm = POR_SLUG['mais-milionaria'];
  const e2 = calcularEstatisticas(hist(mm, 291, 300), mm, 10);
  assert.equal(e2.extras.itens.reduce((s, x) => s + x.freq, 0), 20);

  const dd = POR_SLUG['dia-de-sorte'];
  const e3 = calcularEstatisticas(hist(dd, 1121, 1130), dd, 10);
  assert.equal(e3.extras.itens[0].nome, 'Março');
  assert.equal(e3.extras.itens[0].freq, 10);
});

test('estatísticas: Lotomania inclui o 00 e Super Sete conta por coluna', () => {
  const lm = POR_SLUG.lotomania;
  const e = calcularEstatisticas(hist(lm, 2811, 2820), lm, 10);
  assert.equal(e.numeros.length, 100);
  assert.equal(e.numeros[0].rotulo, '00');

  const ss = POR_SLUG['super-sete'];
  const h = hist(ss, 751, 760);
  const e2 = calcularEstatisticas(h, ss, 10);
  assert.equal(e2.colunas.length, 7);
  for (const c of e2.colunas) assert.equal(c.digitos.reduce((s, d) => s + d.freq, 0), 10);
  assert.equal(e2.colunas[0].digitos[Number(h[9].n[0])].freq >= 1, true);
  assert.ok(renderEstatisticas(e2, ss).includes('Col. 7'));
});

test('estatísticas: histórico com buracos e janela inválida', () => {
  const l = POR_SLUG.quina;
  const h = hist(l, 6841, 6890).filter((x) => x.c % 5 !== 0); // 10 concursos faltando
  const e = calcularEstatisticas(h, l, 50);
  assert.equal(e.concursos, 40);
  assert.equal(janelaValida('100'), 100);
  assert.equal(janelaValida('7'), JANELA_PADRAO);
  assert.equal(janelaValida(undefined), JANELA_PADRAO);
  assert.ok(renderEstatisticas(calcularEstatisticas([], l, 10), l).includes('aviso'));
});

test('estatísticas: renderiza todas as modalidades e escapa texto da API', () => {
  for (const l of LOTERIAS.filter(temEstatistica)) {
    const ultimo = { megasena: 2950, lotofacil: 3540, quina: 6890, lotomania: 2820, timemania: 2300, duplasena: 2850, diadesorte: 1130, supersete: 760, maismilionaria: 300 }[l.api];
    const html = renderEstatisticas(calcularEstatisticas(hist(l, ultimo - 9, ultimo), l, 10), l);
    assert.ok(html.includes('concursos analisados'), l.slug);
  }
  const t = POR_SLUG.timemania;
  const h = hist(t, 2291, 2300);
  h[0].x = '<img src=x onerror=alert(1)>';
  assert.ok(!renderEstatisticas(calcularEstatisticas(h, t, 10), t).includes('<img'));
  assert.ok(!LOTERIAS.filter(temEstatistica).some((l) => l.tipo === 'federal' || l.tipo === 'loteca'));
});

test('calendário: dias descritos a partir da grade', () => {
  assert.equal(descreverDias(POR_SLUG['mega-sena']), 'terças e quintas, às 21h; domingos, às 11h');
  assert.equal(descreverDias(POR_SLUG.lotofacil), 'de segunda a sexta, às 21h; domingos, às 11h');
  assert.equal(descreverDias(POR_SLUG.federal), 'quartas, às 20h; domingos, às 11h');
  assert.equal(descreverDias(POR_SLUG.lotomania), 'segundas, quartas e sextas, às 21h');
  assert.ok(LOTERIAS.every((l) => !l.sorteios || l.sorteios.every(([d]) => d !== 6)), 'sem sorteio regular aos sábados');
  assert.equal(sorteiosDoDia(6).length, 0);
  const dom = sorteiosDoDia(0);
  assert.ok(dom.every((s) => s.hora === 11));
  assert.ok(dom.some((s) => s.lot.slug === 'mega-sena'));
});

test('calendário: próximos sorteios respeitam dia, horário e o fuso de Brasília', () => {
  const mega = POR_SLUG['mega-sena'];
  // sábado 14/11/2026, 10h em Brasília → próximo é domingo 15/11 às 11h
  const sab = agoraBrasilia(new Date('2026-11-14T13:00:00Z'));
  assert.deepEqual([sab.dia, sab.mes, sab.hora, sab.diaSemana], [14, 11, 10, 6]);
  const p = proximosSorteios(mega, sab, 4);
  assert.deepEqual(p.map((s) => s.data), ['15/11/2026', '17/11/2026', '19/11/2026', '22/11/2026']);
  assert.equal(rotuloDia(p[0], sab), 'Amanhã');
  // terça 17/11 às 20h59 → hoje ainda conta; às 21h já passou
  const antes = agoraBrasilia(new Date('2026-11-17T23:59:00Z'));
  assert.equal(proximosSorteios(mega, antes, 1)[0].hoje, true);
  const depois = agoraBrasilia(new Date('2026-11-18T00:00:00Z'));
  assert.equal(proximosSorteios(mega, depois, 1)[0].data, '19/11/2026');
  // 1h UTC de quarta ainda é terça à noite em Brasília
  assert.equal(agoraBrasilia(new Date('2026-11-18T01:30:00Z')).diaSemana, 2);
  // virada de ano
  const fimAno = agoraBrasilia(new Date('2026-12-31T23:30:00Z'));
  assert.equal(proximosSorteios(POR_SLUG.federal, fimAno, 1)[0].data, '03/01/2027');
  assert.deepEqual(proximosSorteios(POR_SLUG.loteca, sab), []);
});
