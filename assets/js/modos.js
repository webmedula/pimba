// Pimba v1.5.0 — modos do gerador: Aleatório puro, Quentes, Frios e Equilibrado (usado no navegador e nos testes)
// Os modos só mudam QUAIS números o gerador prefere. Em sorteio honesto todo número tem a mesma chance em cada
// concurso, então nenhum modo aumenta a probabilidade de ganhar: é só um jeito diferente (e divertido) de escolher.

export const MODOS = [
  { id: 'aleatorio', nome: 'Aleatório puro', curto: 'Todos os números com o mesmo peso, como no sorteio.', estatistica: false },
  { id: 'quentes', nome: 'Quentes', curto: 'Prefere os números que mais saíram nos últimos concursos.', estatistica: true },
  { id: 'frios', nome: 'Frios', curto: 'Prefere os números que estão há mais tempo sem sair.', estatistica: true },
  { id: 'equilibrado', nome: 'Equilibrado', curto: 'Mistura pares e ímpares e espalha os números por todo o volante.', estatistica: false },
];
export const MODO_PADRAO = 'aleatorio';
export const POR_ID = Object.fromEntries(MODOS.map((m) => [m.id, m]));

/** Aceita o parâmetro ?modo= e devolve sempre um modo válido. */
export const modoValido = (v) => (POR_ID[v] ? v : MODO_PADRAO);

/** Aviso curto que acompanha cada jogo gerado. */
export function avisoModo(id, est, lot) {
  const base = ' Isso não muda sua chance: em cada sorteio todos os números têm a mesma probabilidade. É só por diversão.';
  const periodo = est?.concursos ? ` nos últimos ${est.concursos} concursos` : '';
  if (id === 'quentes') return `Modo Quentes: demos mais peso aos números que mais saíram${periodo}.${base}`;
  if (id === 'frios' && lot?.tipo === 'colunas') return `Modo Frios: demos mais peso aos números que menos saíram em cada coluna${periodo}.${base}`;
  if (id === 'frios') return `Modo Frios: demos mais peso aos números que estão há mais tempo sem sair${periodo}.${base}`;
  if (id === 'equilibrado') return `Modo Equilibrado: jogo com pares e ímpares na mesma medida e números espalhados pelo volante.${base}`;
  return 'Aleatório puro: cada número teve exatamente o mesmo peso, como no sorteio oficial.';
}

/** Número aleatório em [0, 1) com gerador criptográfico quando existir. */
export function aleatorioUnit() {
  if (globalThis.crypto?.getRandomValues) {
    const b = new Uint32Array(1);
    globalThis.crypto.getRandomValues(b);
    return b[0] / 0x100000000;
  }
  return Math.random();
}

/** Escolhe `qtd` itens distintos, cada um com chance proporcional ao seu peso (sem reposição). */
export function sortearComPeso(itens, pesos, qtd, rand = aleatorioUnit) {
  const pool = itens.map((v, i) => ({ v, p: Math.max(0, pesos[i]) }));
  const out = [];
  while (out.length < qtd && pool.length) {
    const total = pool.reduce((s, x) => s + x.p, 0);
    let idx;
    if (total <= 0) idx = Math.floor(rand() * pool.length);
    else {
      let r = rand() * total;
      idx = pool.findIndex((x) => (r -= x.p) < 0);
      if (idx < 0) idx = pool.length - 1;
    }
    out.push(pool[idx].v);
    pool.splice(idx, 1);
  }
  return out;
}

// Pesos pela posição no ranking (empates dividem a posição): o 1º colocado vale 1 + 8 = 9 e o último vale 1.
// Usar a posição, e não o valor bruto, evita que um único número fora da curva achate todos os outros.
// Os "quentes"/"frios" ficam bem mais prováveis de entrar no jogo, mas qualquer número ainda pode aparecer.
const REFORCO = 8;
function pesosPor(medidas) {
  const n = medidas.length;
  if (n < 2) return medidas.map(() => 1);
  const ordem = medidas.map((m, i) => [m, i]).sort((a, b) => a[0] - b[0]);
  const pos = new Array(n);
  for (let i = 0; i < n;) {
    let j = i;
    while (j + 1 < n && ordem[j + 1][0] === ordem[i][0]) j++;
    for (let k = i; k <= j; k++) pos[ordem[k][1]] = (i + j) / 2;
    i = j + 1;
  }
  return pos.map((p) => 1 + REFORCO * (p / (n - 1)) ** 2);
}

/** Pesos de cada número (dezenas) para o modo, a partir de `calcularEstatisticas`. */
export function pesosDezenas(modo, est) {
  if (!est?.numeros?.length) return null;
  if (modo === 'quentes') return pesosPor(est.numeros.map((x) => x.freq));
  if (modo === 'frios') return pesosPor(est.numeros.map((x) => (x.atraso === null ? est.concursos : x.atraso)));
  return null;
}

/** Pesos dos dígitos 0..9 de uma coluna do Super Sete (frios = os que menos saíram na coluna). */
export function pesosColuna(modo, est, i) {
  const col = est?.colunas?.[i];
  if (!col) return null;
  const f = col.digitos.map((d) => d.freq);
  if (modo === 'quentes') return pesosPor(f);
  if (modo === 'frios') return pesosPor(f.map((x) => -x));
  return null;
}

/** Pesos dos extras (trevos 1..6 ou meses) a partir de est.extras; nomes sem dado contam como zero. */
export function pesosExtras(modo, est, nomes) {
  if (!est?.extras?.itens?.length || (modo !== 'quentes' && modo !== 'frios')) return null;
  const chave = (n) => String(n).trim().toLocaleLowerCase('pt-BR');
  const f = new Map(est.extras.itens.map((i) => [chave(i.nome), i.freq]));
  const medidas = nomes.map((n) => f.get(chave(n)) || 0);
  return pesosPor(modo === 'quentes' ? medidas : medidas.map((x) => -x));
}

/** Regras do modo Equilibrado: pares/ímpares perto da metade e números espalhados em 5 faixas do volante. */
export function equilibrado(nums, lot) {
  const qtd = nums.length;
  const pares = nums.filter((n) => n % 2 === 0).length;
  if (Math.abs(pares - qtd / 2) > 1) return false;
  const total = lot.max - lot.min + 1;
  const faixas = new Array(5).fill(0);
  for (const n of nums) faixas[Math.min(4, Math.floor(((n - lot.min) * 5) / total))]++;
  const ocupadas = faixas.filter(Boolean).length;
  const teto = Math.ceil((qtd / 5) * 1.6) + 1;
  return ocupadas >= Math.min(5, qtd) && Math.max(...faixas) <= teto;
}

/** Super Sete equilibrado: 3 ou 4 pares e pelo menos 5 dígitos diferentes. */
export function colunasEquilibradas(dig) {
  const pares = dig.filter((d) => d % 2 === 0).length;
  return (pares === 3 || pares === 4) && new Set(dig).size >= 5;
}

/**
 * Gera os números de um jogo de dezenas no modo pedido (ordenados).
 * @param est estatísticas (obrigatórias para quentes/frios; sem elas cai no aleatório puro)
 */
export function jogoDezenas(modo, lot, qtd, est, rand = aleatorioUnit) {
  const universo = Array.from({ length: lot.max - lot.min + 1 }, (_, i) => lot.min + i);
  const ordenar = (a) => a.sort((x, y) => x - y);
  const pesos = pesosDezenas(modo, est);
  if (pesos) return ordenar(sortearComPeso(universo, pesos, qtd, rand));
  const iguais = universo.map(() => 1);
  if (modo === 'equilibrado') {
    let nums;
    for (let t = 0; t < 2000; t++) {
      nums = sortearComPeso(universo, iguais, qtd, rand);
      if (equilibrado(nums, lot)) break;
    }
    return ordenar(nums);
  }
  return ordenar(sortearComPeso(universo, iguais, qtd, rand));
}

/** Gera os 7 dígitos do Super Sete (um por coluna) no modo pedido. */
export function jogoColunas(modo, est, rand = aleatorioUnit) {
  const digitos = Array.from({ length: 10 }, (_, i) => i);
  const umDigito = (i) => {
    const p = pesosColuna(modo, est, i) || digitos.map(() => 1);
    return sortearComPeso(digitos, p, 1, rand)[0];
  };
  let dig;
  const tentativas = modo === 'equilibrado' ? 2000 : 1;
  for (let t = 0; t < tentativas; t++) {
    dig = Array.from({ length: 7 }, (_, i) => umDigito(i));
    if (modo !== 'equilibrado' || colunasEquilibradas(dig)) break;
  }
  return dig;
}

/** Escolhe extras (trevos ou mês) respeitando o modo quando houver estatística deles. */
export function escolherExtras(modo, est, nomes, qtd, rand = aleatorioUnit) {
  const p = pesosExtras(modo, est, nomes) || nomes.map(() => 1);
  return sortearComPeso(nomes, p, qtd, rand);
}
