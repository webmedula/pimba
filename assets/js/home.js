// Pimba v1.6.3 — home e índice de resultados: carrega o último concurso de todas as loterias.
// Se /api/resultados vier sem alguma loteria (a CAIXA falhou naquele momento), cada card que faltou é
// buscado sozinho em /api/resultado/<loteria>, o mesmo endereço que a página de cada loteria usa.
import { LOTERIAS, POR_SLUG } from './loterias.js';
import { renderCard, brl, esc, fmtInt } from './render.js';

const grid = document.getElementById('home-resultados');
const destaque = document.getElementById('maior-premio');
const dados = {};

const buscarJson = async (url) => {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(r.status);
  return r.json();
};

function desenharCard(slug) {
  const atual = grid?.querySelector(`[data-card="${slug}"]`);
  if (!atual) return;
  const novo = document.createElement('div');
  novo.innerHTML = renderCard(dados[slug], POR_SLUG[slug]).trim();
  const card = novo.firstElementChild;
  card.dataset.card = slug;
  atual.replaceWith(card);
}

function desenharGrade() {
  if (!grid) return;
  grid.innerHTML = LOTERIAS.map((l) => renderCard(dados[l.slug], l).replace('<article ', `<article data-card="${l.slug}" `)).join('');
}

function desenharDestaque() {
  if (!destaque) return;
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

/** Busca uma loteria sozinha (até 2 tentativas). */
async function buscarUma(slug) {
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    try {
      const d = await buscarJson(`/api/resultado/${slug}`);
      if (d?.concurso) return d;
    } catch {
      /* tenta de novo */
    }
    await new Promise((ok) => setTimeout(ok, 800));
  }
  return null;
}

async function completarFaltantes() {
  const faltam = LOTERIAS.filter((l) => !dados[l.slug] || dados[l.slug].desatualizado).map((l) => l.slug);
  await Promise.all(
    faltam.map(async (slug) => {
      const d = await buscarUma(slug);
      if (d && (!dados[slug] || d.concurso >= dados[slug].concurso)) {
        dados[slug] = d;
        desenharCard(slug);
      }
    }),
  );
  if (faltam.length) desenharDestaque();
}

async function carregar() {
  try {
    Object.assign(dados, await buscarJson('/api/resultados'));
  } catch {
    /* segue: os cards são buscados um a um */
  }
  desenharGrade();
  desenharDestaque();
  await completarFaltantes();
}

// "Tentar de novo" no card: busca só aquela loteria, sem sair da página.
grid?.addEventListener('click', async (e) => {
  const link = e.target.closest('[data-tentar]');
  if (!link) return;
  e.preventDefault();
  const slug = link.dataset.tentar;
  link.textContent = 'Buscando…';
  const d = await buscarUma(slug);
  if (d) {
    dados[slug] = d;
    desenharCard(slug);
    desenharDestaque();
  } else {
    // v1.6.3: antes ia para a página da loteria, que também dependia da CAIXA e falhava igual.
    link.textContent = 'Ainda sem resposta. Tentar de novo';
  }
});

// Quem deixa a página aberta (ou volta para a aba depois) vê o resultado novo sem recarregar.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - carregadoEm > 5 * 60 * 1000) {
    carregadoEm = Date.now();
    carregar();
  }
});
let carregadoEm = Date.now();
carregar();
