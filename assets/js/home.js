// Pimba v1.0.0 — home e índice de resultados: carrega o último concurso de todas as loterias
import { LOTERIAS } from './loterias.js';
import { renderCard, brl, esc, fmtInt } from './render.js';

const grid = document.getElementById('home-resultados');
const destaque = document.getElementById('maior-premio');

async function carregar() {
  let dados = {};
  try {
    const r = await fetch('/api/resultados');
    if (!r.ok) throw new Error(r.status);
    dados = await r.json();
  } catch {
    dados = {};
  }
  if (grid) grid.innerHTML = LOTERIAS.map((l) => renderCard(dados[l.slug], l)).join('');

  if (destaque) {
    const candidatos = LOTERIAS.map((l) => ({ l, r: dados[l.slug] })).filter((x) => x.r?.proximo?.estimativa);
    candidatos.sort((a, b) => b.r.proximo.estimativa - a.r.proximo.estimativa);
    const top = candidatos[0];
    if (top) {
      destaque.style.setProperty('--cor', top.l.cor);
      destaque.innerHTML = `<p class="hd-label">Maior prêmio em jogo</p>
<p class="hd-valor">${brl(top.r.proximo.estimativa)}</p>
<p class="hd-info"><strong>${esc(top.l.nome)}</strong> · concurso ${fmtInt(top.r.proximo.concurso)}${top.r.proximo.data ? ` · ${esc(top.r.proximo.data)}` : ''}</p>
<a class="btn btn-primario btn-peq" href="/resultados/${top.l.slug}/">Ver último resultado</a>`;
    } else {
      destaque.innerHTML = `<p class="hd-label">Maior prêmio em jogo</p><p class="hd-info">Não foi possível carregar agora. <a href="/resultados/">Ver resultados</a></p>`;
    }
  }
}
carregar();
