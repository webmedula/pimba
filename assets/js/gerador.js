// Pimba v1.5.0 — gerador de números (crypto.getRandomValues) com modos Aleatório, Quentes, Frios e Equilibrado
import { POR_SLUG } from './loterias.js';
import { bolas, esc } from './render.js';
import { temEstatistica, JANELA_PADRAO, janelaValida } from './stats.js';
import { POR_ID, avisoModo, escolherExtras, jogoColunas, jogoDezenas, modoValido } from './modos.js';

const $ = (id) => document.getElementById(id);
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const TREVOS = [1, 2, 3, 4, 5, 6].map((n) => `Trevo ${n}`);
let lot;
let ultimos = [];
let ultimoModo = '';
const cacheEst = new Map(); // slug|janela → estatísticas (só nesta visita; a API nunca fica no cache offline)

function aleatorio(max) {
  // inteiro uniforme em [0, max) sem viés de módulo
  const lim = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf); while (buf[0] >= lim);
  return buf[0] % max;
}

export function sortear(min, max, qtd) {
  const pool = [];
  for (let n = min; n <= max; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, qtd).sort((a, b) => a - b);
}

const modoAtual = () => modoValido(document.querySelector('input[name="modo"]:checked')?.value);
const janelaAtual = () => janelaValida($('ger-janela').value);

function opcoesQtd() {
  const sel = $('ger-qtd');
  if (lot.tipo === 'colunas') {
    sel.innerHTML = '<option value="7">7 colunas</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = lot.escolhe === lot.escolheMax;
  let html = '';
  for (let n = lot.escolhe; n <= lot.escolheMax; n++) html += `<option value="${n}">${n} números</option>`;
  sel.innerHTML = html;
}

function atualizarModo() {
  const modo = POR_ID[modoAtual()];
  const comEst = temEstatistica(lot);
  document.querySelectorAll('input[name="modo"]').forEach((r) => {
    const precisa = POR_ID[r.value].estatistica;
    r.disabled = precisa && !comEst;
  });
  $('ger-modo-desc').textContent = modo.curto;
  $('ger-campo-janela').hidden = !modo.estatistica;
  const link = $('ger-link-est');
  link.hidden = !modo.estatistica;
  link.href = `/estatisticas/${lot.slug}/${janelaAtual() === JANELA_PADRAO ? '' : `?n=${janelaAtual()}`}`;
  link.textContent = `Ver as estatísticas da ${lot.nome}`;
  // Mantém a escolha no endereço (dá para compartilhar o link do modo)
  const url = new URL(location.href);
  url.searchParams.set('l', lot.slug);
  if (modo.id === 'aleatorio') url.searchParams.delete('modo'); else url.searchParams.set('modo', modo.id);
  history.replaceState(null, '', url);
}

async function buscarEstatisticas(janela) {
  const chave = `${lot.slug}|${janela}`;
  if (cacheEst.has(chave)) return cacheEst.get(chave);
  const r = await fetch(`/api/estatisticas/${lot.slug}?n=${janela}`);
  if (!r.ok) throw new Error(String(r.status));
  const est = await r.json();
  if (!est.parcial) cacheEst.set(chave, est);
  return est;
}

async function gerar() {
  const qtdJogos = Number($('ger-jogos').value);
  const qtd = Number($('ger-qtd').value);
  let modo = modoAtual();
  let est = null;
  let nota = '';
  const btn = $('ger-ok');

  if (POR_ID[modo].estatistica) {
    btn.disabled = true;
    btn.textContent = 'Buscando estatísticas…';
    try {
      est = await buscarEstatisticas(janelaAtual());
      if (!est.concursos) throw new Error('vazio');
    } catch {
      nota = '<p class="aviso ger-aviso">Não conseguimos carregar as estatísticas agora (sem internet ou CAIXA fora do ar). Geramos no modo Aleatório puro.</p>';
      modo = 'aleatorio';
      est = null;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Gerar números';
    }
  }

  ultimos = [];
  const blocos = [];
  const fmt = (n) => String(n).padStart(2, '0');
  for (let j = 0; j < qtdJogos; j++) {
    let nums;
    let extra = '';
    let texto;
    if (lot.tipo === 'colunas') {
      nums = jogoColunas(modo, est);
      texto = nums.join(' ');
    } else {
      nums = jogoDezenas(modo, lot, qtd, est);
      texto = nums.map(fmt).join(' ');
      if (lot.trevos) {
        const t = escolherExtras(modo, est, TREVOS, 2).map((s) => Number(s.slice(6))).sort((a, b) => a - b);
        extra = `<p class="extra">Trevos: ${t.join(' e ')}</p>`;
        texto += ` | trevos ${t.join(' ')}`;
      }
      if (lot.extra === 'mes') {
        const m = escolherExtras(modo, est, MESES, 1)[0];
        extra = `<p class="extra">Mês de Sorte: ${m}</p>`;
        texto += ` | mês ${m}`;
      }
      if (lot.extra === 'time') extra = '<p class="extra">Escolha seu Time do Coração no volante.</p>';
    }
    ultimos.push(texto);
    blocos.push(`<div class="jogo-gerado"><span class="jogo-n">Jogo ${j + 1}</span>${bolas(nums, lot, '')}${extra}</div>`);
  }
  $('ger-saida').innerHTML = `${nota}<div class="ger-res" style="--cor:${lot.cor}">${blocos.join('')}
<p class="ger-nota-modo">${esc(avisoModo(modo, est, lot))}</p>
<p class="muted small">${esc(lot.nome)} · ${esc(POR_ID[modo].nome)} · gerado em ${new Date().toLocaleString('pt-BR')}</p></div>`;
  $('ger-copiar').hidden = false;
  ultimoModo = POR_ID[modo].nome;
}

$('ger-ok').addEventListener('click', gerar);
$('ger-copiar').addEventListener('click', async () => {
  const txt = `${lot.nome} (${ultimoModo})\n${ultimos.map((t, i) => `Jogo ${i + 1}: ${t}`).join('\n')}\n— gerado no pimba.com.br`;
  try {
    await navigator.clipboard.writeText(txt);
    $('ger-copiar').textContent = 'Copiado!';
    setTimeout(() => { $('ger-copiar').textContent = 'Copiar jogos'; }, 2000);
  } catch {
    $('ger-copiar').textContent = 'Não foi possível copiar';
  }
});
const limpar = () => { $('ger-saida').innerHTML = ''; $('ger-copiar').hidden = true; };
document.querySelectorAll('input[name="lot"]').forEach((r) =>
  r.addEventListener('change', () => {
    lot = POR_SLUG[r.value];
    opcoesQtd();
    if (POR_ID[modoAtual()].estatistica && !temEstatistica(lot)) document.querySelector('input[name="modo"][value="aleatorio"]').checked = true;
    atualizarModo();
    limpar();
  }));
document.querySelectorAll('input[name="modo"]').forEach((r) => r.addEventListener('change', () => { atualizarModo(); limpar(); }));
$('ger-janela').addEventListener('change', () => { atualizarModo(); limpar(); });

const params = new URLSearchParams(location.search);
const radio = document.querySelector(`input[name="lot"][value="${params.get('l')}"]`) || document.querySelector('input[name="lot"]:checked');
radio.checked = true;
lot = POR_SLUG[radio.value];
const radioModo = document.querySelector(`input[name="modo"][value="${modoValido(params.get('modo'))}"]`);
if (radioModo) radioModo.checked = true;
opcoesQtd();
atualizarModo();
