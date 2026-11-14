// Pimba — servidor falso que imita a API da Caixa, para testes locais.
// Uso: node test/mock-caixa.mjs  (porta 8788)  e, em .dev.vars: CAIXA_API_BASE=http://127.0.0.1:8788/api
// Os números aqui são FICTÍCIOS e servem apenas para testar o layout e a lógica.
import { createServer } from 'node:http';

const ULTIMO = { megasena: 2950, lotofacil: 3540, quina: 6890, lotomania: 2820, timemania: 2300, duplasena: 2850, diadesorte: 1130, supersete: 760, maismilionaria: 300, federal: 6010, loteca: 1210 };

function rng(seed) {
  let s = seed % 2147483647;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const sorteia = (r, min, max, q) => {
  const set = new Set();
  while (set.size < q) set.add(min + Math.floor(r() * (max - min + 1)));
  return [...set];
};
const d2 = (n) => String(n).padStart(2, '0');

export function fixture(api, numero) {
  const r = rng(numero * 31 + api.length * 7);
  const base = {
    acumulado: false, dataApuracao: '13/11/2026', dataProximoConcurso: '15/11/2026', numero,
    numeroConcursoAnterior: numero - 1, numeroConcursoProximo: numero + 1, ultimoConcurso: numero === ULTIMO[api],
    localSorteio: 'ESPAÇO DA SORTE', nomeMunicipioUFSorteio: 'SÃO PAULO, SP', valorArrecadado: 123456789.5,
    valorEstimadoProximoConcurso: 3500000, listaMunicipioUFGanhadores: [], nomeTimeCoracaoMesSorte: '',
    listaDezenasSegundoSorteio: null, trevosSorteados: null, listaResultadoEquipeEsportiva: null,
  };
  const faixas = (descs, ganh, valores) => descs.map((d, i) => ({ descricaoFaixa: d, faixa: i + 1, numeroDeGanhadores: ganh[i], valorPremio: valores[i] }));
  switch (api) {
    case 'megasena': {
      const dz = sorteia(r, 1, 60, 6);
      return { ...base, acumulado: true, valorEstimadoProximoConcurso: 85000000, listaDezenas: [...dz].sort((a, b) => a - b).map(d2), dezenasSorteadasOrdemSorteio: dz.map(d2),
        listaRateioPremio: faixas(['6 acertos', '5 acertos', '4 acertos'], [0, 61, 4210], [0, 52310.44, 1120.07]) };
    }
    case 'lotofacil': {
      const dz = sorteia(r, 1, 25, 15).sort((a, b) => a - b);
      return { ...base, listaDezenas: dz.map(d2), dezenasSorteadasOrdemSorteio: dz.map(d2), valorEstimadoProximoConcurso: 5000000,
        listaMunicipioUFGanhadores: [{ ganhadores: 1, municipio: 'GOIANIA', nomeFatansiaUL: '', posicao: 1, serie: '', uf: 'GO' }, { ganhadores: 1, municipio: 'CANAL ELETRONICO', nomeFatansiaUL: '', posicao: 2, serie: '', uf: '--' }],
        listaRateioPremio: faixas(['15 acertos', '14 acertos', '13 acertos', '12 acertos', '11 acertos'], [2, 310, 11025, 140221, 701332], [1650332.12, 1834.55, 35, 14, 7]) };
    }
    case 'quina': {
      const dz = sorteia(r, 1, 80, 5).sort((a, b) => a - b);
      return { ...base, acumulado: true, valorEstimadoProximoConcurso: 12000000, listaDezenas: dz.map(d2), dezenasSorteadasOrdemSorteio: dz.map(d2),
        listaRateioPremio: faixas(['5 acertos', '4 acertos', '3 acertos', '2 acertos'], [0, 45, 4100, 101000], [0, 9800.5, 110.2, 4.75]) };
    }
    case 'lotomania': {
      const dz = sorteia(r, 0, 99, 20).sort((a, b) => a - b);
      return { ...base, listaDezenas: dz.map(d2), listaRateioPremio: faixas(['20 acertos', '19 acertos', '18 acertos', '17 acertos', '16 acertos', '15 acertos', '0 acertos'], [0, 3, 40, 300, 1800, 7000, 1], [0, 60000, 2300, 180, 30, 9, 210000]) };
    }
    case 'timemania': {
      const dz = sorteia(r, 1, 80, 7).sort((a, b) => a - b);
      return { ...base, acumulado: true, nomeTimeCoracaoMesSorte: 'GOIÁS/GO', listaDezenas: dz.map(d2), listaRateioPremio: faixas(['7 acertos', '6 acertos', '5 acertos', '4 acertos', '3 acertos', 'Time do Coração'], [0, 2, 60, 1100, 12000, 7000], [0, 40000, 1900, 9, 3.5, 8.75]) };
    }
    case 'duplasena': {
      const a = sorteia(r, 1, 50, 6).sort((x, y) => x - y); const b = sorteia(r, 1, 50, 6).sort((x, y) => x - y);
      return { ...base, listaDezenas: a.map(d2), listaDezenasSegundoSorteio: b.map(d2),
        listaRateioPremio: faixas(['6 acertos - 1º sorteio', '5 acertos - 1º sorteio', '4 acertos - 1º sorteio', '3 acertos - 1º sorteio', '6 acertos - 2º sorteio', '5 acertos - 2º sorteio', '4 acertos - 2º sorteio', '3 acertos - 2º sorteio'], [0, 3, 200, 3000, 0, 2, 180, 2900], [0, 4100, 120, 3, 0, 2900, 90, 3]) };
    }
    case 'diadesorte': {
      const dz = sorteia(r, 1, 31, 7).sort((a, b) => a - b);
      return { ...base, nomeTimeCoracaoMesSorte: 'Março', listaDezenas: dz.map(d2), listaRateioPremio: faixas(['7 acertos', '6 acertos', '5 acertos', '4 acertos', 'Mês de Sorte'], [1, 50, 1800, 22000, 50000], [450000, 2100, 25, 5, 2.5]) };
    }
    case 'supersete': {
      return { ...base, listaDezenas: Array.from({ length: 7 }, () => String(Math.floor(r() * 10))), listaRateioPremio: faixas(['7 acertos', '6 acertos', '5 acertos', '4 acertos', '3 acertos'], [0, 1, 20, 310, 3500], [0, 30000, 1500, 60, 6]) };
    }
    case 'maismilionaria': {
      const dz = sorteia(r, 1, 50, 6).sort((a, b) => a - b);
      return { ...base, acumulado: true, valorEstimadoProximoConcurso: 140000000, listaDezenas: dz.map(d2), trevosSorteados: sorteia(r, 1, 6, 2).sort().map(String),
        listaRateioPremio: faixas(['6 acertos + 2 trevos', '6 acertos + 1 ou nenhum trevo', '5 acertos + 2 trevos', '5 acertos + 1 ou nenhum trevo', '4 acertos + 2 trevos', '4 acertos + 1 ou nenhum trevo', '3 acertos + 2 trevos', '3 acertos + 1 trevo', '2 acertos + 2 trevos', '2 acertos + 1 trevo'], [0, 0, 1, 12, 80, 900, 1200, 9000, 8000, 60000], [0, 0, 120000, 9000, 1500, 150, 50, 24, 12, 6]) };
    }
    case 'federal': {
      const bilhetes = Array.from({ length: 5 }, () => String(Math.floor(r() * 100000)).padStart(6, '0'));
      return { ...base, valorEstimadoProximoConcurso: 0, listaDezenas: bilhetes, listaRateioPremio: faixas(['1º Prêmio', '2º Prêmio', '3º Prêmio', '4º Prêmio', '5º Prêmio'], [1, 1, 1, 1, 1], [500000, 27000, 24000, 19000, 18000]) };
    }
    case 'loteca': {
      const times = ['FLAMENGO/RJ', 'PALMEIRAS/SP', 'GOIAS/GO', 'VILA NOVA/GO', 'GREMIO/RS', 'INTER/RS', 'BAHIA/BA', 'VITORIA/BA', 'SANTOS/SP', 'SAO PAULO/SP', 'CRUZEIRO/MG', 'ATLETICO/MG', 'FORTALEZA/CE', 'CEARA/CE'];
      return { ...base, listaDezenas: [], valorEstimadoProximoConcurso: 1500000,
        listaResultadoEquipeEsportiva: Array.from({ length: 14 }, (_, i) => ({ nuSequencial: i + 1, nomeEquipeUm: times[i], nomeEquipeDois: times[13 - i], nuGolEquipeUm: Math.floor(r() * 4), nuGolEquipeDois: Math.floor(r() * 3), diaSemana: 'SÁB' })),
        listaRateioPremio: faixas(['14 acertos', '13 acertos'], [0, 12], [0, 3400]) };
    }
    default: return null;
  }
}

if (process.argv[1]?.endsWith('mock-caixa.mjs')) {
  createServer((req, res) => {
    const [, api, n] = req.url.split('?')[0].split('/').filter(Boolean); // /api/:api/:n
    const numero = n ? parseInt(n, 10) : ULTIMO[api];
    const data = api in ULTIMO && numero > 0 && numero <= ULTIMO[api] ? fixture(api, numero) : null;
    res.writeHead(data ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data || { erro: 'não encontrado' }));
  }).listen(8788, () => console.log('Mock da Caixa em http://127.0.0.1:8788/api'));
}
