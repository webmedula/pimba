// Pimba v1.4.0 — gera os ícones do app (PWA/Android) e a imagem de destaque da Play Store.
// Uso (só quando mudar a marca): node scripts/gerar-icones.mjs
// Precisa do Playwright com Chromium instalado na máquina (não é dependência do site).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/img/app');
const fonte = readFileSync(join(ROOT, 'node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2')).toString('base64');

const css = `@font-face{font-family:Outfit;src:url(data:font/woff2;base64,${fonte}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}html,body{background:transparent}
.bola{border-radius:50%;background:radial-gradient(circle at 32% 30%,#fff3c4 0 12%,#ffc93c 40%,#ffb703 100%);color:#101935;font-family:Outfit;font-weight:900;display:grid;place-items:center;box-shadow:inset calc(var(--s)*-.06) calc(var(--s)*-.08) 0 rgba(0,0,0,.12)}`;

// fundo: null = transparente; escala: diâmetro da bola em relação ao lado
const bola = (lado, escala) => {
  const s = Math.round(lado * escala);
  return `<div class="bola" style="--s:${s}px;width:${s}px;height:${s}px;font-size:${Math.round(s * 0.6)}px;line-height:1;padding-bottom:${Math.round(s * 0.04)}px">P</div>`;
};
const icone = (lado, escala, fundo) =>
  `<div style="width:${lado}px;height:${lado}px;display:grid;place-items:center;${fundo ? `background:${fundo}` : ''}">${bola(lado, escala)}</div>`;

const PECAS = [
  // purpose "any": a bola sozinha, como o favicon
  ['icon-192.png', 192, 192, icone(192, 0.94, null)],
  ['icon-512.png', 512, 512, icone(512, 0.94, null)],
  // purpose "maskable": fundo azul até a borda e a bola dentro da zona segura (círculo central de 80%)
  ['maskable-192.png', 192, 192, icone(192, 0.62, '#101935')],
  ['maskable-512.png', 512, 512, icone(512, 0.62, '#101935')],
  // ícone da ficha da Play Store (512x512, a Play aplica a máscara)
  ['play-icone-512.png', 512, 512, icone(512, 0.7, '#101935')],
  // imagem de destaque da Play Store (1024x500)
  ['play-destaque-1024x500.png', 1024, 500, `<div style="width:1024px;height:500px;background:#101935;display:flex;align-items:center;gap:56px;padding:0 90px;font-family:Outfit;color:#fff">
    ${bola(500, 0.62)}
    <div><div style="font-size:112px;font-weight:900;letter-spacing:-2px;line-height:1">pimba<span style="color:#ffc93c">!</span></div>
    <div style="font-size:38px;font-weight:500;margin-top:18px;color:#d7dcf0;line-height:1.25">Resultados das loterias,<br>conferidor e estatísticas</div></div></div>`],
];

const browser = await chromium.launch();
for (const [nome, w, h, html] of PECAS) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(`<style>${css}</style>${html}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, nome), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  console.log('gerado', nome);
}
await browser.close();
