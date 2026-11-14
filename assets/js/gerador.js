// Pimba v1.0.0 — gerador de números aleatórios (crypto.getRandomValues)
import { POR_SLUG } from './loterias.js';
import { bolas, esc } from './render.js';

const $ = (id) => document.getElementById(id);
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
let lot;
let ultimos = [];

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

function gerar() {
  const qtdJogos = Number($('ger-jogos').value);
  const qtd = Number($('ger-qtd').value);
  ultimos = [];
  const blocos = [];
  for (let j = 0; j < qtdJogos; j++) {
    let nums;
    let extra = '';
    let texto;
    if (lot.tipo === 'colunas') {
      nums = Array.from({ length: 7 }, () => aleatorio(10));
      texto = nums.join(' ');
    } else {
      nums = sortear(lot.min, lot.max, qtd);
      const fmt = (n) => String(n).padStart(2, '0');
      texto = nums.map(fmt).join(' ');
      if (lot.trevos) {
        const t = sortear(1, 6, 2);
        extra = `<p class="extra">Trevos: ${t.join(' e ')}</p>`;
        texto += ` | trevos ${t.join(' ')}`;
      }
      if (lot.extra === 'mes') {
        const m = MESES[aleatorio(12)];
        extra = `<p class="extra">Mês de Sorte: ${m}</p>`;
        texto += ` | mês ${m}`;
      }
      if (lot.extra === 'time') extra = '<p class="extra">Escolha seu Time do Coração no volante.</p>';
    }
    ultimos.push(texto);
    blocos.push(`<div class="jogo-gerado"><span class="jogo-n">Jogo ${j + 1}</span>${bolas(nums, lot, '')}${extra}</div>`);
  }
  $('ger-saida').innerHTML = `<div class="ger-res">${blocos.join('')}<p class="muted small">${esc(lot.nome)} · gerado em ${new Date().toLocaleString('pt-BR')}</p></div>`;
  $('ger-copiar').hidden = false;
}

$('ger-ok').addEventListener('click', gerar);
$('ger-copiar').addEventListener('click', async () => {
  const txt = `${lot.nome}\n${ultimos.map((t, i) => `Jogo ${i + 1}: ${t}`).join('\n')}\n— gerado no pimba.com.br`;
  try {
    await navigator.clipboard.writeText(txt);
    $('ger-copiar').textContent = 'Copiado!';
    setTimeout(() => { $('ger-copiar').textContent = 'Copiar jogos'; }, 2000);
  } catch {
    $('ger-copiar').textContent = 'Não foi possível copiar';
  }
});
document.querySelectorAll('input[name="lot"]').forEach((r) =>
  r.addEventListener('change', () => { lot = POR_SLUG[r.value]; opcoesQtd(); $('ger-saida').innerHTML = ''; $('ger-copiar').hidden = true; }));

const inicial = new URLSearchParams(location.search).get('l');
const radio = document.querySelector(`input[name="lot"][value="${inicial}"]`) || document.querySelector('input[name="lot"]:checked');
radio.checked = true;
lot = POR_SLUG[radio.value];
opcoesQtd();
