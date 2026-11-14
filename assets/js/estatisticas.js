// Pimba v1.1.0 — página de estatísticas: troca a janela (10/25/50/100 concursos) e busca no navegador se preciso
import { POR_SLUG } from './loterias.js';
import { renderEstatisticas, janelaValida, JANELA_PADRAO } from './stats.js';

const el = document.getElementById('estatisticas');
const lot = el && POR_SLUG[el.dataset.slug];
let tentativas = 0;

function carregar(n) {
  el.setAttribute('aria-busy', 'true');
  fetch(`/api/estatisticas/${lot.slug}?n=${n}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((est) => {
      el.innerHTML = renderEstatisticas(est, lot);
      el.removeAttribute('aria-busy');
      // Histórico ainda sendo montado no servidor: tenta de novo algumas vezes.
      if (est.parcial && tentativas++ < 3) setTimeout(() => carregar(n), 2500);
    })
    .catch(() => {
      el.removeAttribute('aria-busy');
      el.innerHTML = `<div class="aviso">Não conseguimos calcular as estatísticas agora. Tente de novo em alguns minutos ou veja o <a href="/resultados/${lot.slug}/">último resultado</a>.</div>`;
    });
}

if (lot) {
  const n = janelaValida(new URLSearchParams(location.search).get('n'));
  const radios = document.querySelectorAll('input[name="janela"]');
  radios.forEach((r) => {
    r.checked = Number(r.value) === n;
    r.addEventListener('change', () => {
      const v = Number(r.value);
      const url = new URL(location.href);
      if (v === JANELA_PADRAO) url.searchParams.delete('n'); else url.searchParams.set('n', v);
      history.replaceState(null, '', url);
      tentativas = 0;
      carregar(v);
    });
  });
  if (!el.dataset.ssr || n !== JANELA_PADRAO) carregar(n);
}
