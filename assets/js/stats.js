// Pimba v1.6.3 — estatísticas dos últimos concursos (cálculo e HTML; usado no Worker, no navegador e nos testes)
// Estatística descreve o passado. Cada sorteio é independente: nada aqui aumenta a chance de ganhar.
import { esc, fmtInt } from './render.js';

export const JANELAS = [10, 25, 50, 100];
export const JANELA_PADRAO = 50;
export const JANELA_MAX = 100;

export const temEstatistica = (lot) => lot.tipo === 'dezenas' || lot.tipo === 'colunas';

/** Guarda só o que a estatística usa de um concurso normalizado (o histórico fica pequeno no cache). */
export const compactar = (r) => ({
  c: r.concurso,
  d: r.data,
  n: r.dezenas || [],
  ...(r.dezenas2?.length ? { n2: r.dezenas2 } : {}),
  ...(r.trevos?.length ? { t: r.trevos } : {}),
  ...(r.timeMes ? { x: r.timeMes } : {}),
});

/**
 * v1.6.3 — o inverso de compactar: monta um resultado mínimo (números, concurso e data, sem premiação) para
 * mostrar quando a CAIXA não responde e não há outra cópia guardada. Sempre marcado como desatualizado.
 */
export const expandir = (h, lot) => ({
  slug: lot.slug, nome: lot.nome, concurso: h.c, data: h.d || '',
  dezenas: h.n || [], ordem: [], dezenas2: h.n2 || [], trevos: h.t || [], timeMes: h.x || '',
  acumulado: false, premios: [], jogos: [], ganhadoresLocais: [], local: '', arrecadado: null,
  anterior: h.c > 1 ? h.c - 1 : null, ultimo: true,
  proximo: { concurso: h.c + 1, data: '', estimativa: null }, acumuladoEspecial: null,
  desatualizado: true, parcial: true,
});

/** Aceita o parâmetro ?n= e devolve sempre uma janela válida. */
export function janelaValida(v) {
  const n = parseInt(v, 10);
  return JANELAS.includes(n) ? n : JANELA_PADRAO;
}

const rotuloNum = (v, lot) => (lot.zeroPad || lot.tipo === 'dezenas' ? String(v).padStart(2, '0') : String(v));

function contar(valores, universo) {
  const m = new Map(universo.map((u) => [u, 0]));
  for (const v of valores) if (m.has(v)) m.set(v, m.get(v) + 1);
  return m;
}

/**
 * Calcula as estatísticas a partir do histórico compacto.
 * @param hist  concursos compactos (qualquer ordem; usa os `janela` mais recentes)
 * @param lot   modalidade (LOTERIAS)
 * @param janela quantos concursos considerar
 */
export function calcularEstatisticas(hist, lot, janela = JANELA_PADRAO) {
  const lista = [...hist].sort((a, b) => b.c - a.c);
  const topo = lista[0]?.c ?? 0;
  const usados = lista.filter((h) => h.c > topo - janela);
  const base = {
    slug: lot.slug, janela, concursos: usados.length,
    de: usados.at(-1)?.c ?? null, ate: usados[0]?.c ?? null,
    dataDe: usados.at(-1)?.d ?? '', dataAte: usados[0]?.d ?? '',
  };
  if (!usados.length) return { ...base, numeros: [], mais: [], menos: [], atrasados: [], extras: null };

  if (lot.tipo === 'colunas') {
    const colunas = Array.from({ length: lot.sorteia }, (_, i) => {
      const freq = contar(usados.map((h) => Number(h.n[i])), Array.from({ length: 10 }, (_, k) => k));
      const digitos = [...freq].map(([n, f]) => ({ n, freq: f }));
      const max = Math.max(...digitos.map((x) => x.freq));
      return { coluna: i + 1, digitos, mais: digitos.filter((x) => x.freq === max).map((x) => x.n) };
    });
    return { ...base, esperado: usados.length / 10, colunas, numeros: [], mais: [], menos: [], atrasados: [], extras: null };
  }

  // Dezenas: conta os dois sorteios da Dupla Sena; atraso = concursos desde a última vez (0 = saiu no último).
  const universo = Array.from({ length: lot.max - lot.min + 1 }, (_, i) => lot.min + i);
  const freq = new Map(universo.map((u) => [u, 0]));
  const atraso = new Map();
  usados.forEach((h, idx) => {
    for (const v of new Set([...h.n, ...(h.n2 || [])].map(Number))) {
      if (!freq.has(v)) continue;
      freq.set(v, freq.get(v) + 1);
      if (!atraso.has(v)) atraso.set(v, idx);
    }
  });
  const sorteiosPorConcurso = lot.duplo ? 2 : 1;
  const numeros = universo.map((n) => ({ n, rotulo: rotuloNum(n, lot), freq: freq.get(n), atraso: atraso.has(n) ? atraso.get(n) : null }));
  const atrasoOrd = (x) => (x.atraso === null ? Infinity : x.atraso);
  const mais = [...numeros].sort((a, b) => b.freq - a.freq || atrasoOrd(a) - atrasoOrd(b) || a.n - b.n).slice(0, 10);
  const menos = [...numeros].sort((a, b) => a.freq - b.freq || atrasoOrd(b) - atrasoOrd(a) || a.n - b.n).slice(0, 10);
  const atrasados = [...numeros].sort((a, b) => atrasoOrd(b) - atrasoOrd(a) || a.n - b.n).slice(0, 10);

  let extras = null;
  if (lot.trevos) {
    const f = contar(usados.flatMap((h) => (h.t || []).map(Number)), [1, 2, 3, 4, 5, 6]);
    extras = { titulo: 'Trevos mais sorteados', itens: [...f].map(([n, q]) => ({ nome: `Trevo ${n}`, freq: q })).sort((a, b) => b.freq - a.freq) };
  } else if (lot.extra) {
    const f = new Map();
    for (const h of usados) if (h.x) f.set(h.x, (f.get(h.x) || 0) + 1);
    extras = {
      titulo: lot.extra === 'mes' ? 'Meses de Sorte mais sorteados' : 'Times do Coração mais sorteados',
      itens: [...f].map(([nome, q]) => ({ nome, freq: q })).sort((a, b) => b.freq - a.freq || a.nome.localeCompare(b.nome, 'pt-BR')).slice(0, 10),
    };
  }

  return {
    ...base,
    esperado: (usados.length * sorteiosPorConcurso * lot.sorteia) / universo.length,
    numeros, mais, menos, atrasados, extras,
  };
}

const fmt1 = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const vezes = (f) => `${fmtInt(f)} ${f === 1 ? 'vez' : 'vezes'}`;
const txtAtraso = (a, est) => (a === null ? `não saiu nos últimos ${est.concursos}` : a === 0 ? 'saiu no último' : `há ${fmtInt(a)} ${a === 1 ? 'concurso' : 'concursos'}`);

function listaBolas(itens, lot, legenda) {
  return `<ol class="est-lista" style="--cor:${lot.cor};--cor-texto:${lot.corTexto || '#fff'}">${itens
    .map((x) => `<li><span class="est-bola">${esc(x.rotulo)}</span><span class="est-qtd">${esc(legenda(x))}</span></li>`)
    .join('')}</ol>`;
}

/** Bloco HTML da página /estatisticas/<loteria>/. */
export function renderEstatisticas(est, lot) {
  if (!est.concursos) return '<div class="aviso">Ainda não há concursos suficientes para calcular as estatísticas.</div>';
  const periodo = `<p class="res-meta">Concursos <strong>${fmtInt(est.de)}</strong> a <strong>${fmtInt(est.ate)}</strong>${est.dataDe ? ` (${esc(est.dataDe)} a ${esc(est.dataAte)})` : ''} · ${fmtInt(est.concursos)} concursos analisados${est.parcial ? ' <span class="tag tag-acum">parcial</span>' : ''}</p>`;
  const parcial = est.parcial
    ? `<p class="muted small">Ainda estamos juntando os concursos mais antigos. Recarregue em alguns segundos para ver os ${fmtInt(est.janela)} concursos.</p>`
    : '';

  if (lot.tipo === 'colunas') {
    const max = Math.max(1, ...est.colunas.flatMap((c) => c.digitos.map((d) => d.freq)));
    return `${periodo}${parcial}
<h2>Números mais sorteados em cada coluna</h2>
<div class="tabela-rolagem"><table class="tabela est-colunas"><thead><tr><th>Número</th>${est.colunas.map((c) => `<th>Col. ${c.coluna}</th>`).join('')}</tr></thead><tbody>
${Array.from({ length: 10 }, (_, d) => `<tr><th scope="row">${d}</th>${est.colunas
    .map((c) => {
      const f = c.digitos[d].freq;
      return `<td class="est-cel${c.mais.includes(d) ? ' est-top' : ''}" style="--i:${(f / max).toFixed(2)};--cor:${lot.cor}">${fmtInt(f)}</td>`;
    })
    .join('')}</tr>`).join('')}
</tbody></table></div>
<p class="muted small">Em destaque, o número que mais saiu em cada coluna. Pelo acaso, cada número sairia em média ${fmt1(est.esperado)} vezes por coluna nesse período.</p>`;
  }

  const max = Math.max(1, ...est.numeros.map((x) => x.freq));
  const mapa = `<div class="est-mapa" style="--cor:${lot.cor}">${est.numeros
    .map((x) => `<span class="est-cel${x.freq / max >= 0.6 ? ' escuro' : ''}" style="--i:${(x.freq / max).toFixed(2)}" title="${esc(x.rotulo)}: ${vezes(x.freq)}, ${txtAtraso(x.atraso, est)}"><b>${esc(x.rotulo)}</b><small>${fmtInt(x.freq)}</small></span>`)
    .join('')}</div>`;

  const extras = est.extras?.itens.length
    ? `<h2>${esc(est.extras.titulo)}</h2><table class="tabela"><thead><tr><th>${lot.trevos ? 'Trevo' : lot.extra === 'mes' ? 'Mês' : 'Time'}</th><th>Vezes</th></tr></thead><tbody>${est.extras.itens
        .map((i) => `<tr><td>${esc(i.nome)}</td><td>${fmtInt(i.freq)}</td></tr>`)
        .join('')}</tbody></table>`
    : '';

  return `${periodo}${parcial}
<div class="est-grade">
  <section><h2>Mais sorteados</h2>${listaBolas(est.mais, lot, (x) => vezes(x.freq))}</section>
  <section><h2>Menos sorteados</h2>${listaBolas(est.menos, lot, (x) => vezes(x.freq))}</section>
  <section><h2>Há mais tempo sem sair</h2>${listaBolas(est.atrasados, lot, (x) => (x.atraso === null ? `fora dos ${est.concursos}` : `${fmtInt(x.atraso)} conc.`))}</section>
</div>
<h2>Todos os números</h2>
<p class="muted small">Quanto mais escura a casa, mais vezes o número saiu${lot.duplo ? ' (somando os dois sorteios de cada concurso)' : ''}. Pelo acaso, cada número sairia em média <strong>${fmt1(est.esperado)} vezes</strong> nesse período: as diferenças que você vê são variação normal.</p>
${mapa}
${extras}`;
}

/** <title> e meta description. */
export function seoEstatisticas(lot) {
  return {
    title: `Números que mais saem na ${lot.nome}: estatísticas e atrasados | Pimba`,
    description: `Números que mais saíram, os que menos saíram e os atrasados da ${lot.nome} nos últimos concursos. Gere um jogo com os quentes ou os frios, com explicação honesta: estatística não aumenta a chance de ganhar.`,
  };
}
