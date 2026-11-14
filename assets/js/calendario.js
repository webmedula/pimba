// Pimba v1.1.0 — calendário: destaca o dia de hoje, lista os próximos sorteios e a data oficial do próximo concurso
import { LOTERIAS, POR_SLUG } from './loterias.js';
import { agoraBrasilia, proximosSorteios, rotuloDia, DIAS } from './datas.js';
import { esc, brlCurto, fmtInt } from './render.js';

const agora = agoraBrasilia();

// Grade semanal: marca a coluna de hoje
document.querySelectorAll(`[data-dia="${agora.diaSemana}"]`).forEach((c) => c.classList.add('hoje'));

// "Hoje tem sorteio de…"
const hoje = document.getElementById('cal-hoje');
if (hoje) {
  const lista = LOTERIAS.filter((l) => l.sorteios?.some(([d]) => d === agora.diaSemana))
    .map((l) => ({ l, hora: l.sorteios.find(([d]) => d === agora.diaSemana)[1] }))
    .sort((a, b) => a.hora - b.hora);
  hoje.innerHTML = lista.length
    ? `<p class="hd-label">Hoje, ${esc(DIAS[agora.diaSemana].toLowerCase())}</p><ul class="cal-hoje-lista">${lista
        .map(({ l, hora }) => `<li><a href="/calendario/${l.slug}/" class="ponto" style="--cor:${l.cor}">${esc(l.nome)}</a> <span>${hora}h</span></li>`)
        .join('')}</ul>`
    : '<p class="hd-label">Hoje</p><p class="hd-info">Não há sorteios regulares hoje.</p>';
}

// Próximas datas calculadas (página de uma loteria)
const prox = document.getElementById('cal-proximos');
const lot = prox && POR_SLUG[prox.dataset.slug];
if (lot) {
  prox.innerHTML = proximosSorteios(lot, agora, 6)
    .map((s) => `<li${s.hoje ? ' class="hoje"' : ''}><strong>${esc(rotuloDia(s, agora))}</strong> ${esc(s.data)} · ${s.hora}h</li>`)
    .join('');
}

// Data oficial do próximo concurso, direto da CAIXA
const oficial = document.querySelectorAll('[data-proximo]');
if (oficial.length) {
  fetch('/api/resultados')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((dados) => {
      oficial.forEach((el) => {
        const r = dados[el.dataset.proximo];
        if (!r?.proximo?.data) return;
        el.innerHTML = `Concurso ${fmtInt(r.proximo.concurso)} · <strong>${esc(r.proximo.data)}</strong>${r.proximo.estimativa ? ` · ${brlCurto(r.proximo.estimativa)}` : ''}`;
      });
    })
    .catch(() => {});
}
