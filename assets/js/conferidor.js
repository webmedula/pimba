// Pimba v1.0.0 — interface do conferidor
import { POR_SLUG } from './loterias.js';
import { bolas, brl, esc, fmtInt } from './render.js';
import { conferir } from './conferir.js';

const $ = (id) => document.getElementById(id);
const grade = $('conf-grade');
const gradeTrevos = $('conf-trevos');
const saida = $('conf-saida');
const contador = $('conf-contador');
let lot;
let sel = new Set(); // dezenas
let colunas = []; // super sete
let trevos = new Set();

const fmt = (n) => (lot.zeroPad || lot.max > 9 ? String(n).padStart(2, '0') : String(n));
const chave = () => `pimba-conf-${lot.slug}`;

function salvarLocal() {
  try {
    localStorage.setItem(chave(), JSON.stringify({ sel: [...sel], colunas, trevos: [...trevos] }));
  } catch { /* navegador sem storage */ }
}
function lerLocal() {
  try {
    const d = JSON.parse(localStorage.getItem(chave()) || 'null');
    if (d) { sel = new Set(d.sel || []); colunas = d.colunas || []; trevos = new Set(d.trevos || []); }
  } catch { /* ignora */ }
}

function atualizarContador() {
  if (lot.tipo === 'colunas') {
    const n = colunas.filter((x) => x !== undefined && x !== null).length;
    contador.textContent = `${n} de 7 colunas marcadas`;
    return;
  }
  let txt = `${sel.size} marcado(s) — aposta de ${lot.escolhe}${lot.escolheMax > lot.escolhe ? ` a ${lot.escolheMax}` : ''} números`;
  if (lot.trevos) txt += ` · ${trevos.size} trevo(s)`;
  contador.textContent = txt;
}

function montar() {
  sel = new Set(); colunas = []; trevos = new Set();
  lerLocal();
  saida.innerHTML = '';
  grade.style.setProperty('--cor', lot.cor);
  grade.style.setProperty('--cor-texto', lot.corTexto || '#fff');
  if (lot.tipo === 'colunas') {
    grade.className = 'grade grade-colunas';
    grade.innerHTML = Array.from({ length: 7 }, (_, c) => `<div class="coluna"><span class="col-tit">${c + 1}ª</span>${Array.from({ length: 10 }, (_, d) =>
      `<button type="button" data-col="${c}" data-n="${d}" aria-pressed="${colunas[c] === d}">${d}</button>`).join('')}</div>`).join('');
  } else {
    grade.className = 'grade';
    let html = '';
    for (let n = lot.min; n <= lot.max; n++) html += `<button type="button" data-n="${n}" aria-pressed="${sel.has(n)}">${fmt(n)}</button>`;
    grade.innerHTML = html;
  }
  gradeTrevos.hidden = !lot.trevos;
  if (lot.trevos) {
    gradeTrevos.style.setProperty('--cor', lot.cor);
    gradeTrevos.innerHTML = `<span class="col-tit">Trevos</span>${[1, 2, 3, 4, 5, 6].map((t) => `<button type="button" data-t="${t}" aria-pressed="${trevos.has(t)}">${t}</button>`).join('')}`;
  }
  atualizarContador();
}

grade.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const n = Number(b.dataset.n);
  if (lot.tipo === 'colunas') {
    const c = Number(b.dataset.col);
    colunas[c] = colunas[c] === n ? null : n;
    grade.querySelectorAll(`[data-col="${c}"]`).forEach((x) => x.setAttribute('aria-pressed', String(Number(x.dataset.n) === colunas[c])));
  } else {
    if (sel.has(n)) sel.delete(n);
    else if (sel.size < lot.escolheMax) sel.add(n);
    else { contador.textContent = `Máximo de ${lot.escolheMax} números na ${lot.nome}.`; return; }
    b.setAttribute('aria-pressed', String(sel.has(n)));
  }
  salvarLocal();
  atualizarContador();
});

gradeTrevos.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const t = Number(b.dataset.t);
  if (trevos.has(t)) trevos.delete(t); else trevos.add(t);
  b.setAttribute('aria-pressed', String(trevos.has(t)));
  salvarLocal();
  atualizarContador();
});

async function executar() {
  if (lot.tipo === 'colunas' ? colunas.filter((x) => x !== null && x !== undefined).length < 7 : sel.size < lot.escolhe) {
    saida.innerHTML = `<div class="aviso">Marque ${lot.tipo === 'colunas' ? 'um número em cada uma das 7 colunas' : `pelo menos ${lot.escolhe} números`} para conferir.</div>`;
    return;
  }
  if (lot.trevos && trevos.size < 2) {
    saida.innerHTML = '<div class="aviso">Marque pelo menos 2 trevos.</div>';
    return;
  }
  const n = $('conf-concurso').value.trim();
  saida.innerHTML = '<div class="carregando"><span></span><span></span><span></span> Conferindo…</div>';
  let res;
  try {
    const r = await fetch(`/api/resultado/${lot.slug}${n ? `/${parseInt(n, 10)}` : ''}`);
    if (!r.ok) throw new Error();
    res = await r.json();
  } catch {
    saida.innerHTML = '<div class="aviso">Não foi possível buscar o resultado desse concurso agora. Confira o número e tente de novo.</div>';
    return;
  }
  const jogo = lot.tipo === 'colunas' ? colunas : [...sel];
  const c = conferir(jogo, [...trevos], res, lot);
  const multipla = lot.tipo !== 'colunas' && sel.size > lot.escolhe;

  const marcar = (lista, acertados) =>
    bolas(lista, lot, 'grandes').replace(/<li>(\d+)<\/li>/g, (m, d) => (acertados.includes(parseInt(d, 10)) ? `<li class="acerto">${d}</li>` : `<li class="erro">${d}</li>`));

  let sorteio;
  if (lot.tipo === 'colunas') {
    sorteio = `<ul class="bolas grandes" style="--cor:${lot.cor};--cor-texto:${lot.corTexto || '#fff'}">${res.dezenas
      .map((d, i) => `<li class="${c.acertados.includes(i) ? 'acerto' : 'erro'}">${esc(parseInt(d, 10))}</li>`).join('')}</ul>`;
  } else {
    sorteio = marcar(res.dezenas, c.acertados);
    if (res.dezenas2?.length) sorteio += `<p class="muted">2º sorteio</p>${marcar(res.dezenas2, c.acertados2)}`;
  }

  const ganhou = c.faixas.map((i) => res.premios[i]).filter((p) => p.ganhadores > 0);
  const titulo = lot.tipo === 'colunas'
    ? `Você acertou ${c.acertos} coluna${c.acertos === 1 ? '' : 's'}`
    : `Você acertou ${c.acertos} número${c.acertos === 1 ? '' : 's'}${c.acertos2 !== null ? ` no 1º sorteio e ${c.acertos2} no 2º` : ''}${c.trevos !== null ? ` e ${c.trevos} trevo${c.trevos === 1 ? '' : 's'}` : ''}`;

  let veredito = '';
  if (multipla) {
    veredito = `<p>Seu jogo tem ${sel.size} números, então vale por várias apostas simples ao mesmo tempo e pode ter prêmios em mais de uma faixa. Confirme o valor exato na lotérica ou no app Loterias CAIXA.</p>`;
  } else if (ganhou.length) {
    veredito = `<p class="ganhou">Pimba! Seu jogo é premiado: <strong>${ganhou.map((p) => `${esc(p.descricao)} — ${brl(p.valor)}`).join('; ')}</strong>.</p><p class="muted small">Valor bruto por aposta simples, divulgado pela CAIXA. Pode haver Imposto de Renda retido na fonte.</p>`;
  } else if (c.faixas.length) {
    veredito = '<p class="ganhou">Sua faixa é premiada! Confira o valor na tabela abaixo.</p>';
  } else {
    veredito = '<p>Dessa vez não deu. Fica para o próximo!</p>';
  }

  const extra = res.timeMes ? `<p class="muted">${lot.extra === 'mes' ? 'Mês de Sorte' : 'Time do Coração'} sorteado: <strong>${esc(res.timeMes)}</strong> — confira no seu bilhete.</p>` : '';

  saida.innerHTML = `<div class="conf-res" style="--cor:${lot.cor}">
  <p class="muted">${esc(lot.nome)} · concurso ${fmtInt(res.concurso)} · ${esc(res.data)}</p>
  <h2>${titulo}</h2>
  ${sorteio}
  ${extra}
  ${veredito}
  <div class="tabela-rolagem"><table class="tabela premios"><thead><tr><th>Faixa</th><th>Ganhadores</th><th>Prêmio</th></tr></thead><tbody>${res.premios
    .map((p, i) => `<tr class="${c.faixas.includes(i) ? 'faixa-sua' : ''}"><td>${esc(p.descricao)}</td><td>${p.ganhadores ? fmtInt(p.ganhadores) : 'Não houve'}</td><td>${p.ganhadores ? brl(p.valor) : '—'}</td></tr>`)
    .join('')}</tbody></table></div>
  <a class="link-mais" href="/resultados/${lot.slug}/${res.concurso}/">Ver resultado completo →</a>
</div>`;
}

document.querySelectorAll('input[name="lot"]').forEach((r) => r.addEventListener('change', () => { lot = POR_SLUG[r.value]; montar(); }));
$('conf-ok').addEventListener('click', executar);
$('conf-limpar').addEventListener('click', () => {
  try { localStorage.removeItem(chave()); } catch { /* ignora */ }
  montar();
});

const inicial = new URLSearchParams(location.search).get('l');
const radio = document.querySelector(`input[name="lot"][value="${inicial}"]`) || document.querySelector('input[name="lot"]:checked');
radio.checked = true;
lot = POR_SLUG[radio.value];
montar();
