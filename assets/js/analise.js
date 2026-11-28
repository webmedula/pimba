// Pimba v1.7.0 — análise de cada concurso, escrita a partir do resultado oficial (usada no Worker, no navegador e nos testes).
// Transforma os números da CAIXA em texto próprio: pares e ímpares, soma, sequências, repetidos do concurso anterior,
// atrasos, e quanto o concurso pagou, sempre com a chance matemática de cada padrão. Não sugere números: cada sorteio
// é independente, e o texto diz isso.
import { brl, esc, fmtInt } from './render.js';

export function comb(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/** Chance de sair exatamente k itens "marcados" num sorteio de s entre N, havendo M marcados (hipergeométrica). */
export const hiper = (N, M, s, k) => (comb(M, k) * comb(N - M, s - k)) / comb(N, s);

export function pct(p) {
  const v = p * 100;
  if (v >= 99.5) return 'mais de 99%';
  if (v > 0 && v < 1) return `${v.toLocaleString('pt-BR', { maximumFractionDigits: v < 0.1 ? 2 : 1 })}%`;
  return `${Math.round(v)}%`;
}

const lbl = (n, lot) => (lot.tipo === 'colunas' ? String(n) : String(n).padStart(2, '0'));
const plural = (n, um, varios) => `${fmtInt(n)} ${n === 1 ? um : varios}`;
const lista = (itens) => (itens.length <= 1 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`);

/** Frases sobre os números de um sorteio de dezenas. */
function frasesDezenas(nums, lot, r, hist) {
  const N = lot.max - lot.min + 1;
  const s = nums.length;
  const frases = [];

  // pares e ímpares
  const pares = nums.filter((n) => n % 2 === 0).length;
  let paresUniverso = 0;
  for (let n = lot.min; n <= lot.max; n++) if (n % 2 === 0) paresUniverso++;
  const pPar = hiper(N, paresUniverso, s, pares);
  frases.push(`O resultado teve ${plural(pares, 'número par', 'números pares')} e ${plural(s - pares, 'ímpar', 'ímpares')}. Essa divisão acontece em ${pct(pPar)} dos sorteios.`);

  // metade de baixo e de cima do volante
  const metade = Math.floor(N / 2);
  const corte = lot.min + metade - 1;
  const baixos = nums.filter((n) => n <= corte).length;
  const pBaixo = hiper(N, metade, s, baixos);
  frases.push(`${baixos === 0 ? 'Nenhum número' : plural(baixos, 'número veio', 'números vieram')} da metade de baixo do volante (até ${lbl(corte, lot)}) e ${plural(s - baixos, 'da metade de cima', 'da metade de cima')}. Uma divisão assim aparece em ${pct(pBaixo)} dos sorteios.`);

  // soma
  const soma = nums.reduce((a, b) => a + b, 0);
  const media = (s * (lot.min + lot.max)) / 2;
  const desvio = Math.sqrt((s * (N * N - 1) / 12) * ((N - s) / (N - 1)));
  const z = (soma - media) / desvio;
  const comoSoma = Math.abs(z) < 1 ? 'dentro da faixa mais comum' : z > 0 ? (z > 2 ? 'bem acima da média' : 'acima da média') : z < -2 ? 'bem abaixo da média' : 'abaixo da média';
  frases.push(`A soma dos números foi ${fmtInt(soma)}, ${comoSoma}: a média esperada é ${fmtInt(Math.round(media))} e cerca de dois terços dos sorteios ficam entre ${fmtInt(Math.round(media - desvio))} e ${fmtInt(Math.round(media + desvio))}.`);

  // números seguidos
  const ordenados = [...nums].sort((a, b) => a - b);
  // sequências de números seguidos (ex.: 03 a 08)
  const seguidos = [];
  let ini = 0;
  for (let i = 1; i <= ordenados.length; i++) {
    if (i < ordenados.length && ordenados[i] - ordenados[i - 1] === 1) continue;
    if (i - ini >= 2) seguidos.push(i - ini === 2 ? `${lbl(ordenados[ini], lot)} e ${lbl(ordenados[i - 1], lot)}` : `${lbl(ordenados[ini], lot)} a ${lbl(ordenados[i - 1], lot)}`);
    ini = i;
  }
  const pAlgumSeguido = 1 - comb(N - s + 1, s) / comb(N, s);
  frases.push(seguidos.length
    ? `Houve ${plural(seguidos.length, 'sequência de números seguidos', 'sequências de números seguidos')}: ${lista(seguidos)}. Pelo menos um par seguido aparece em ${pct(pAlgumSeguido)} dos sorteios, então isso é ${pAlgumSeguido > 0.5 ? 'o normal' : 'menos comum do que parece'}.`
    : `Não houve números seguidos. Pelo menos um par seguido aparece em ${pct(pAlgumSeguido)} dos sorteios${pAlgumSeguido > 0.5 ? ', então um resultado sem nenhum é o caso menos comum' : ''}.`);

  // comparação com o concurso anterior e atrasos (precisa do histórico)
  const antes = (hist || []).filter((h) => h.c < r.concurso).sort((a, b) => b.c - a.c);
  const anterior = antes.find((h) => h.c === r.concurso - 1);
  if (anterior) {
    const ant = new Set((anterior.n || []).map(Number));
    const rep = ordenados.filter((n) => ant.has(n));
    const esperado = (s * s) / N;
    frases.push(rep.length
      ? `${plural(rep.length, 'número repetiu', 'números repetiram')} do concurso ${fmtInt(anterior.c)}: ${lista(rep.map((n) => lbl(n, lot)))}. A média é de ${esperado.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${esperado < 2 ? 'número repetido' : 'números repetidos'} por concurso.`
      : `Nenhum número repetiu do concurso ${fmtInt(anterior.c)}. A média é de ${esperado.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${esperado < 2 ? 'número repetido' : 'números repetidos'} por concurso.`);
  }
  if (antes.length >= 10) {
    const atraso = (n) => {
      const i = antes.findIndex((h) => (h.n || []).map(Number).includes(n) || (h.n2 || []).map(Number).includes(n));
      return i === -1 ? null : i;
    };
    const atrasos = ordenados.map((n) => ({ n, a: atraso(n) }));
    const nunca = atrasos.filter((x) => x.a === null);
    const maior = atrasos.filter((x) => x.a !== null).sort((a, b) => b.a - a.a)[0];
    if (nunca.length) {
      frases.push(`${lista(nunca.map((x) => lbl(x.n, lot)))} ${nunca.length === 1 ? 'não aparecia' : 'não apareciam'} em nenhum dos ${fmtInt(antes.length)} concursos anteriores que temos guardados.`);
    } else if (maior && maior.a > 0) {
      frases.push(`O número mais "atrasado" do resultado era o ${lbl(maior.n, lot)}, que estava havia ${plural(maior.a, 'concurso', 'concursos')} sem sair. Atraso não aumenta nem diminui a chance de um número sair: as bolas não têm memória.`);
    }
  }
  return frases;
}

function frasesColunas(nums, lot, r, hist) {
  const frases = [];
  const distintos = new Set(nums).size;
  const pTodosDiferentes = (10 * 9 * 8 * 7 * 6 * 5 * 4) / 1e7;
  frases.push(distintos === 7
    ? `Os 7 números das colunas foram todos diferentes, o que acontece em só ${pct(pTodosDiferentes)} dos concursos. O normal no Super Sete é algum número aparecer em mais de uma coluna.`
    : `Saíram ${plural(distintos, 'número diferente', 'números diferentes')} nas 7 colunas, ou seja, houve repetição entre colunas, como acontece em ${pct(1 - pTodosDiferentes)} dos concursos.`);
  const soma = nums.reduce((a, b) => a + b, 0);
  frases.push(`A soma das 7 colunas foi ${fmtInt(soma)}. A média esperada é 31,5, e a maioria dos concursos fica entre 24 e 39.`);
  const pares = nums.filter((n) => n % 2 === 0).length;
  frases.push(`${plural(pares, 'coluna teve', 'colunas tiveram')} número par. Essa divisão acontece em ${pct(comb(7, pares) / 128)} dos concursos.`);
  const anterior = (hist || []).find((h) => h.c === r.concurso - 1);
  if (anterior?.n?.length === 7) {
    const iguais = nums.map((n, i) => (Number(anterior.n[i]) === n ? i + 1 : 0)).filter(Boolean);
    frases.push(iguais.length
      ? `${plural(iguais.length, 'coluna repetiu', 'colunas repetiram')} o número do concurso ${fmtInt(anterior.c)} (${iguais.length === 1 ? 'coluna' : 'colunas'} ${lista(iguais.map(String))}). Em média, 0,7 coluna se repete de um concurso para o outro.`
      : `Nenhuma coluna repetiu o número do concurso ${fmtInt(anterior.c)}. Em média, 0,7 coluna se repete de um concurso para o outro.`);
  }
  return frases;
}

function frasesLoteca(r) {
  const jogos = (r.jogos || []).filter((j) => Number.isFinite(j.golsM) && Number.isFinite(j.golsV));
  if (!jogos.length) return [];
  const casa = jogos.filter((j) => j.golsM > j.golsV).length;
  const empate = jogos.filter((j) => j.golsM === j.golsV).length;
  const fora = jogos.length - casa - empate;
  const gols = jogos.reduce((a, j) => a + j.golsM + j.golsV, 0);
  const goleada = jogos.reduce((a, j) => (Math.abs(j.golsM - j.golsV) > Math.abs(a.golsM - a.golsV) ? j : a), jogos[0]);
  const frases = [
    `A rodada teve ${plural(casa, 'vitória do mandante', 'vitórias do mandante')}, ${plural(empate, 'empate', 'empates')} e ${plural(fora, 'vitória do visitante', 'vitórias do visitante')}.`,
    `Foram ${plural(gols, 'gol', 'gols')} nos ${jogos.length} jogos, média de ${(gols / jogos.length).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} por partida.`,
  ];
  if (Math.abs(goleada.golsM - goleada.golsV) >= 3) frases.push(`O placar mais elástico foi ${esc(goleada.mandante)} ${goleada.golsM} × ${goleada.golsV} ${esc(goleada.visitante)}.`);
  return frases;
}

function frasesPremios(r, lot) {
  const premios = r.premios || [];
  if (!premios.length || lot.tipo === 'federal') return [];
  const frases = [];
  const p = premios[0];
  if (p.ganhadores) {
    const vezes = lot.preco ? Math.round(p.valor / lot.preco) : 0;
    frases.push(`A faixa principal (${esc(p.descricao)}) saiu para ${plural(p.ganhadores, 'aposta', 'apostas')}, com ${brl(p.valor)}${p.ganhadores > 1 ? ' para cada uma' : ''}${vezes > 1 ? `, ou ${fmtInt(vezes)} vezes o preço da aposta mínima (${brl(lot.preco)})` : ''}.`);
  } else {
    frases.push(`Ninguém acertou a faixa principal (${esc(p.descricao)})${r.acumulado ? ' e o prêmio acumulou' : ''}.${r.proximo?.estimativa ? ` A estimativa para o concurso ${fmtInt(r.proximo.concurso)} é de ${brl(r.proximo.estimativa)}.` : ''}`);
  }
  const premiadas = premios.reduce((a, x) => a + (x.ganhadores || 0), 0);
  const total = premios.reduce((a, x) => a + (x.ganhadores || 0) * (x.valor || 0), 0);
  if (premiadas && total) frases.push(`Somando todas as faixas, ${plural(premiadas, 'aposta foi premiada', 'apostas foram premiadas')}, num total de ${brl(total)} em prêmios.`);
  const locais = r.ganhadoresLocais || [];
  if (locais.length > 1) {
    const ufs = new Set(locais.map((g) => g.uf)).size;
    frases.push(`O prêmio principal foi dividido entre apostas de ${plural(locais.length, 'lugar', 'lugares')} diferentes, em ${plural(ufs, 'estado', 'estados')}.`);
  }
  return frases;
}

/**
 * HTML da seção "Análise do concurso". `hist` (opcional) são concursos compactos ({c, n, n2}) para comparar com o
 * concurso anterior e calcular atrasos. Devolve '' quando não há o que analisar.
 */
export function renderAnalise(r, lot, hist = []) {
  if (!r || r.parcial) return '';
  let numeros = [];
  if (lot.tipo === 'dezenas' && r.dezenas?.length) {
    numeros = frasesDezenas(r.dezenas.map(Number), lot, r, hist);
    if (lot.duplo && r.dezenas2?.length) {
      const um = new Set(r.dezenas.map(Number));
      const comuns = r.dezenas2.map(Number).filter((n) => um.has(n));
      numeros.push(comuns.length
        ? `No 2º sorteio, ${plural(comuns.length, 'número coincidiu', 'números coincidiram')} com o 1º: ${lista(comuns.map((n) => lbl(n, lot)))}.`
        : 'Nenhum número do 2º sorteio coincidiu com o 1º.');
    }
    if (lot.trevos && r.trevos?.length === 2) numeros.push(`Os trevos sorteados foram ${lbl(r.trevos[0], lot)} e ${lbl(r.trevos[1], lot)}. Quem marcou só 2 trevos tinha uma chance em 15 de acertar os dois.`);
  } else if (lot.tipo === 'colunas' && r.dezenas?.length === 7) {
    numeros = frasesColunas(r.dezenas.map(Number), lot, r, hist);
  } else if (lot.tipo === 'loteca') {
    numeros = frasesLoteca(r);
  }
  const premios = frasesPremios(r, lot);
  if (!numeros.length && !premios.length) return '';
  return `<section class="analise" id="analise-concurso">
  <h2>Análise do concurso ${fmtInt(r.concurso)}</h2>
  ${numeros.length ? `<h3>${lot.tipo === 'loteca' ? 'Os jogos' : 'Os números'}</h3>${numeros.map((f) => `<p>${f}</p>`).join('')}` : ''}
  ${premios.length ? `<h3>Os prêmios</h3>${premios.map((f) => `<p>${f}</p>`).join('')}` : ''}
  <p class="muted small">Análise calculada pelo Pimba a partir do resultado oficial. Ela descreve o que aconteceu neste concurso e não indica números para o próximo: em cada sorteio, todas as combinações têm a mesma chance.</p>
</section>`;
}
