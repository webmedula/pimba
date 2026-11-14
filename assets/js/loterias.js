// Pimba v1.1.0 — dados das modalidades (compartilhado entre build, Worker e navegador)
// Preços: tabela de aposta mínima vigente em out/2026. Conferir em loterias.caixa.gov.br quando houver reajuste.
// Sorteios: [dia da semana (0 = domingo), hora de Brasília]. Calendário vigente desde 19/07/2026, quando os
// concursos de sábado passaram para domingo às 11h (dias úteis às 21h; Federal às 20h). Conferido em nov/2026.
// Probabilidades: calculadas por combinatória para a aposta mínima (batem com as publicadas pela Caixa).

export const LOTERIAS = [
  {
    slug: 'mega-sena', api: 'megasena', nome: 'Mega-Sena', cor: '#209869', tipo: 'dezenas',
    min: 1, max: 60, escolhe: 6, escolheMax: 20, sorteia: 6,
    preco: 6.0, sorteios: [[2, 21], [4, 21], [0, 11]],
    regra: 'Marque de 6 a 20 números entre 1 e 60. Ganha quem acertar 4, 5 ou 6 dezenas.',
    odds: [['6 acertos (Sena)', 50063860], ['5 acertos (Quina)', 154518], ['4 acertos (Quadra)', 2332]],
  },
  {
    slug: 'lotofacil', api: 'lotofacil', nome: 'Lotofácil', cor: '#930089', tipo: 'dezenas',
    min: 1, max: 25, escolhe: 15, escolheMax: 20, sorteia: 15,
    preco: 3.5, sorteios: [[1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [0, 11]],
    regra: 'Marque de 15 a 20 números entre 1 e 25. Ganha quem acertar 11, 12, 13, 14 ou 15 dezenas.',
    odds: [['15 acertos', 3268760], ['14 acertos', 21792], ['13 acertos', 692], ['12 acertos', 60], ['11 acertos', 11]],
  },
  {
    slug: 'quina', api: 'quina', nome: 'Quina', cor: '#260085', tipo: 'dezenas',
    min: 1, max: 80, escolhe: 5, escolheMax: 15, sorteia: 5,
    preco: 3.0, sorteios: [[1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [0, 11]],
    regra: 'Marque de 5 a 15 números entre 1 e 80. Ganha quem acertar 2, 3, 4 ou 5 dezenas.',
    odds: [['5 acertos (Quina)', 24040016], ['4 acertos (Quadra)', 64107], ['3 acertos (Terno)', 866], ['2 acertos (Duque)', 36]],
  },
  {
    slug: 'lotomania', api: 'lotomania', nome: 'Lotomania', cor: '#F78100', tipo: 'dezenas',
    min: 0, max: 99, escolhe: 50, escolheMax: 50, sorteia: 20, zeroPad: true,
    preco: 3.0, sorteios: [[1, 21], [3, 21], [5, 21]],
    regra: 'Marque 50 números entre 00 e 99. São sorteados 20. Ganha quem acertar 15 a 20 dezenas, ou nenhuma.',
    odds: [['20 acertos', 11372636], ['19 acertos', 352552], ['18 acertos', 24236], ['17 acertos', 2777], ['16 acertos', 473], ['15 acertos', 112], ['0 acertos', 11372636]],
  },
  {
    slug: 'timemania', api: 'timemania', nome: 'Timemania', cor: '#049645', tipo: 'dezenas',
    min: 1, max: 80, escolhe: 10, escolheMax: 10, sorteia: 7, extra: 'time',
    preco: 3.5, sorteios: [[2, 21], [4, 21], [0, 11]],
    regra: 'Marque 10 números entre 1 e 80 e escolha um Time do Coração. São sorteados 7 números. Ganha quem acertar 3 a 7 dezenas ou o time.',
    odds: [['7 acertos', 26472637], ['6 acertos', 216103], ['5 acertos', 5220], ['4 acertos', 276], ['3 acertos', 29], ['Time do Coração', 80]],
  },
  {
    slug: 'dupla-sena', api: 'duplasena', nome: 'Dupla Sena', cor: '#A61324', tipo: 'dezenas',
    min: 1, max: 50, escolhe: 6, escolheMax: 15, sorteia: 6, duplo: true,
    preco: 3.0, sorteios: [[1, 21], [3, 21], [5, 21]],
    regra: 'Marque de 6 a 15 números entre 1 e 50. Há dois sorteios por concurso. Ganha quem acertar 3 a 6 dezenas em qualquer um deles.',
    odds: [['6 acertos (por sorteio)', 15890700], ['5 acertos', 60192], ['4 acertos', 1120], ['3 acertos', 60]],
  },
  {
    slug: 'dia-de-sorte', api: 'diadesorte', nome: 'Dia de Sorte', cor: '#CB852B', tipo: 'dezenas',
    min: 1, max: 31, escolhe: 7, escolheMax: 15, sorteia: 7, extra: 'mes',
    preco: 2.5, sorteios: [[1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [0, 11]],
    regra: 'Marque de 7 a 15 números entre 1 e 31 e escolha um Mês de Sorte. Ganha quem acertar 4 a 7 dezenas ou o mês.',
    odds: [['7 acertos', 2629575], ['6 acertos', 15652], ['5 acertos', 454], ['4 acertos', 37], ['Mês de Sorte', 12]],
  },
  {
    slug: 'super-sete', api: 'supersete', nome: 'Super Sete', cor: '#A8CF45', corTexto: '#1d2b00', tipo: 'colunas',
    min: 0, max: 9, escolhe: 7, sorteia: 7,
    preco: 3.0, sorteios: [[1, 21], [3, 21], [5, 21]],
    regra: 'Escolha um número de 0 a 9 em cada uma das 7 colunas. Ganha quem acertar 3 a 7 colunas.',
    odds: [['7 colunas', 10000000], ['6 colunas', 158730], ['5 colunas', 5879], ['4 colunas', 392], ['3 colunas', 44]],
  },
  {
    slug: 'mais-milionaria', api: 'maismilionaria', nome: '+Milionária', cor: '#2E3078', tipo: 'dezenas',
    min: 1, max: 50, escolhe: 6, escolheMax: 12, sorteia: 6, trevos: true,
    preco: 6.0, sorteios: [[3, 21], [0, 11]],
    regra: 'Marque de 6 a 12 números entre 1 e 50 e 2 a 6 trevos entre 1 e 6. O prêmio principal exige 6 números e 2 trevos.',
    odds: [['6 acertos + 2 trevos', 238360500], ['6 acertos + 1 ou 0 trevo', 17025750], ['5 acertos + 2 trevos', 902881], ['5 acertos + 1 ou 0 trevo', 64491], ['4 acertos + 2 trevos', 16798], ['4 acertos + 1 ou 0 trevo', 1200], ['3 acertos + 2 trevos', 900], ['3 acertos + 1 trevo', 112], ['2 acertos + 2 trevos', 117], ['2 acertos + 1 trevo', 15]],
  },
  {
    slug: 'federal', api: 'federal', nome: 'Loteria Federal', cor: '#103099', tipo: 'federal',
    sorteios: [[3, 20], [0, 11]],
    regra: 'Você compra um bilhete numerado (inteiro ou fração). São sorteados 5 bilhetes premiados, e há prêmios menores por aproximação e final.',
    odds: [['1º prêmio (bilhete exato)', 100000]],
  },
  {
    slug: 'loteca', api: 'loteca', nome: 'Loteca', cor: '#FB1F00', tipo: 'loteca',
    preco: 4.0, sorteios: null, dias: 'uma vez por semana, conforme a rodada de futebol (a apuração costuma sair na segunda-feira)',
    regra: 'Palpite no resultado de 14 jogos de futebol (vitória, empate ou derrota). Ganha quem acertar 13 ou 14.',
    odds: [['14 acertos', 4782969], ['13 acertos', 170820]],
  },
];

const NOMES_DIAS = ['domingos', 'segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados'];

/** Texto legível dos dias de sorteio, gerado a partir de `sorteios` (fonte única para páginas e calendário). */
export function descreverDias(lot) {
  if (!lot.sorteios) return lot.dias || '';
  const uteis = lot.sorteios.filter(([d]) => d >= 1 && d <= 5).map(([d]) => d);
  const fim = lot.sorteios.filter(([d]) => d === 0 || d === 6);
  const partes = [];
  if (uteis.length === 5) partes.push(`de segunda a sexta, às ${lot.sorteios.find(([d]) => d === 1)[1]}h`);
  else if (uteis.length) {
    const nomes = uteis.map((d) => NOMES_DIAS[d]);
    const hora = lot.sorteios.find(([d]) => d === uteis[0])[1];
    partes.push(`${nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes[0]}, às ${hora}h`);
  }
  for (const [d, h] of fim) partes.push(`${NOMES_DIAS[d]}, às ${h}h`);
  return partes.join('; ');
}

for (const l of LOTERIAS) l.dias = descreverDias(l);

export const POR_SLUG = Object.fromEntries(LOTERIAS.map((l) => [l.slug, l]));
export const POR_API = Object.fromEntries(LOTERIAS.map((l) => [l.api, l]));
