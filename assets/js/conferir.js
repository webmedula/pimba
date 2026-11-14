// Pimba v1.0.0 — lógica pura do conferidor (testável no Node)

const NOMES = { sena: 6, quina: 5, quadra: 4, terno: 3, duque: 2 };

/** Interpreta a descrição de faixa da Caixa: "6 acertos", "Quina", "5 acertos + 2 trevos", "Sena - 2º sorteio"… */
export function interpretarFaixa(descricao) {
  const d = String(descricao || '').toLowerCase();
  let acertos = null;
  const m = d.match(/(\d+)\s*(acerto|coluna|n[úu]mero)/);
  if (m) acertos = Number(m[1]);
  if (acertos === null) {
    for (const [k, v] of Object.entries(NOMES)) if (d.includes(k)) { acertos = v; break; }
  }
  const sorteio = /2\s*[ºo°]?\s*sorteio/.test(d) ? 2 : /1\s*[ºo°]?\s*sorteio/.test(d) ? 1 : 0;
  let trevos = null;
  if (d.includes('trevo')) {
    const depois = d.split('+')[1] ?? d;
    trevos = (depois.match(/\d+/g) || []).map(Number);
    if (/nenhum|sem|zero/.test(depois)) trevos.push(0);
  }
  return { acertos, sorteio, trevos };
}

const ints = (lista) => lista.map((x) => parseInt(x, 10));

/**
 * @param {number[]} jogo   números escolhidos (ou 7 dígitos, para colunas)
 * @param {number[]} trevosJogo
 * @param {object} res      resultado normalizado
 * @param {object} lot      definição da loteria
 */
export function conferir(jogo, trevosJogo, res, lot) {
  const out = { acertos: 0, acertos2: null, trevos: null, acertados: [], acertados2: [], faixas: [] };
  if (lot.tipo === 'colunas') {
    const sorteadas = ints(res.dezenas);
    sorteadas.forEach((d, i) => {
      if (jogo[i] === d) { out.acertos++; out.acertados.push(i); }
    });
  } else {
    const meus = new Set(jogo);
    const s1 = ints(res.dezenas);
    out.acertados = s1.filter((d) => meus.has(d));
    out.acertos = out.acertados.length;
    if (res.dezenas2?.length) {
      const s2 = ints(res.dezenas2);
      out.acertados2 = s2.filter((d) => meus.has(d));
      out.acertos2 = out.acertados2.length;
    }
    if (res.trevos?.length) {
      const meusT = new Set(trevosJogo);
      out.trevos = ints(res.trevos).filter((t) => meusT.has(t)).length;
    }
  }

  // Só faz sentido para aposta mínima; com mais números o jogo equivale a várias apostas.
  res.premios.forEach((p, idx) => {
    const f = interpretarFaixa(p.descricao);
    if (f.acertos === null) return;
    const alvo = f.sorteio === 2 ? out.acertos2 : f.sorteio === 1 ? out.acertos : null;
    const bate = alvo !== null ? alvo === f.acertos : out.acertos === f.acertos || out.acertos2 === f.acertos;
    if (!bate) return;
    if (f.trevos && out.trevos !== null && !f.trevos.includes(out.trevos)) return;
    out.faixas.push(idx);
  });
  return out;
}
