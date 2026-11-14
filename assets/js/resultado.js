// Pimba v1.0.0 — página de resultado: se o servidor não entregou pronto, busca no navegador
import { POR_SLUG } from './loterias.js';
import { renderResultado, seo } from './render.js';

const el = document.getElementById('resultado');
if (el && !el.dataset.ssr) {
  const lot = POR_SLUG[el.dataset.slug];
  const n = el.dataset.concurso || new URLSearchParams(location.search).get('concurso') || '';
  fetch(`/api/resultado/${lot.slug}${n ? `/${n}` : ''}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      el.innerHTML = renderResultado(d, lot);
      const h = document.querySelector('.h1-concurso');
      if (h) h.textContent = ` — concurso ${d.concurso}`;
      document.title = seo(d, lot).title;
    })
    .catch(() => {
      el.innerHTML = `<div class="aviso">Não conseguimos buscar o resultado agora. Tente de novo em alguns minutos ou consulte o <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener">site oficial das Loterias CAIXA</a>.</div>`;
    });
}
