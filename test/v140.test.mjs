// Pimba v1.4.0 — testes do app (PWA + Android/TWA) (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assetLinks, fingerprintsValidos, manifesto, scriptModoApp, serviceWorker, SEM_CACHE_OFFLINE } from '../scripts/app.mjs';
import { blocoParceiro } from '../scripts/parceiro.mjs';
import { SITE } from '../src/config.js';

const FP = 'AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89';

test('manifesto instalável: nome, start_url, standalone e ícones 192/512 (any e maskable)', () => {
  const m = manifesto(SITE);
  assert.equal(m.short_name, 'Pimba');
  assert.equal(m.display, 'standalone');
  assert.equal(m.scope, '/');
  assert.ok(m.start_url.startsWith('/'));
  for (const tam of ['192x192', '512x512']) {
    assert.ok(m.icons.some((i) => i.sizes === tam && i.purpose === 'any'));
    assert.ok(m.icons.some((i) => i.sizes === tam && i.purpose === 'maskable'));
  }
  for (const i of m.icons) readFileSync(new URL(`..${i.src}`, import.meta.url)); // o arquivo existe
});

test('assetlinks: só com impressão digital válida, sem duplicadas', () => {
  assert.equal(assetLinks({ pacoteAndroid: 'br.com.pimba.app', sha256: [] }), null);
  const l = assetLinks({ pacoteAndroid: 'br.com.pimba.app', sha256: [FP, FP.toLowerCase()] });
  assert.equal(l[0].target.package_name, 'br.com.pimba.app');
  assert.deepEqual(l[0].target.sha256_cert_fingerprints, [FP]);
  assert.deepEqual(l[0].relation, ['delegate_permission/common.handle_all_urls']);
  assert.throws(() => fingerprintsValidos({ sha256: ['COLE:AQUI'] }), /inválido/);
  assert.doesNotThrow(() => fingerprintsValidos(SITE.app)); // a configuração atual não quebra o deploy
});

test('config do Bubblewrap bate com o site', () => {
  const twa = JSON.parse(readFileSync(new URL('../android/twa-manifest.json', import.meta.url), 'utf8'));
  assert.equal(twa.packageId, SITE.app.pacoteAndroid);
  assert.equal(twa.host, new URL(SITE.url).host);
  assert.equal(twa.startUrl, '/?origem=android');
  assert.equal(twa.appVersionName, SITE.versao);
});

test('modo app: liga pela origem=android ou pelo referrer do pacote, guardado só na aba', () => {
  const js = scriptModoApp(SITE);
  assert.ok(js.includes('origem=android'));
  assert.ok(js.includes('android-app://'));
  assert.ok(js.includes('br.com.pimba.app'));
  assert.ok(js.includes('sessionStorage'));
  assert.ok(!js.includes('localStorage')); // não pode vazar para o Chrome comum
  assert.ok(js.includes("classList.add('modo-app')"));
});

test('no app, "Comprar cota" e WhatsApp da lotérica ficam escondidos e o aviso aparece', () => {
  const p = { ...SITE.parceiro, whatsapp: '5562900000000' };
  for (const variante of ['boloes', 'home']) {
    const html = blocoParceiro(p, { variante });
    const iAviso = html.indexOf('so-no-app');
    const iBloco = html.indexOf('data-fora-do-app');
    assert.ok(iAviso >= 0 && iBloco > iAviso);
    // todos os links de compra e WhatsApp estão depois da marca data-fora-do-app
    for (const alvo of ['cota-caixa', 'wa.me']) assert.ok(html.indexOf(alvo) > iBloco, `${variante}: ${alvo}`);
    assert.ok(!html.slice(iAviso, iBloco).includes('href='), 'o aviso do app não tem link');
  }
  const css = readFileSync(new URL('../assets/css/style.css', import.meta.url), 'utf8');
  assert.ok(css.includes('.modo-app [data-fora-do-app] { display: none !important; }'));
});

test('service worker nunca guarda resultado para offline', () => {
  for (const p of ['/resultados/', '/estatisticas/', '/api/']) assert.ok(SEM_CACHE_OFFLINE.includes(p));
  const sw = serviceWorker('9.9.9');
  assert.ok(sw.includes("const VERSAO = 'pimba-v9.9.9'"));
  assert.ok(sw.includes("'/offline/'"));
  assert.ok(sw.includes('url.origin !== self.location.origin')); // não mexe em AdSense/Analytics
});

test('build liga manifesto, service worker e assetlinks', () => {
  const build = readFileSync(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.ok(build.includes('<link rel="manifest" href="/manifest.webmanifest">'));
  assert.ok(build.includes("'manifest.webmanifest'") && build.includes("'sw.js'"));
  assert.ok(build.includes("salvar('/offline'") && build.includes('{ sitemap: false }'));
  const worker = readFileSync(new URL('../worker/index.js', import.meta.url), 'utf8');
  assert.ok(worker.includes("'/.well-known/assetlinks.json'"));
  const wr = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  assert.ok(wr.includes('"/.well-known/*"'));
});
