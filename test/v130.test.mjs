// Pimba v1.3.0 — testes do AdSense (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { adsTxt, adsenseAtivo, anuncio, scriptAdsense, slotDe } from '../scripts/anuncios.mjs';
import { SITE } from '../src/config.js';

const site = { adsenseClient: 'ca-pub-6982528073256938', adsenseSlots: { padrao: '1111111111', resultado: '2222222222', estatisticas: '' } };

test('código de editor do Pimba configurado e script igual ao do painel', () => {
  assert.equal(SITE.adsenseClient, 'ca-pub-6982528073256938');
  assert.equal(scriptAdsense(SITE), '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6982528073256938" crossorigin="anonymous"></script>');
});

test('ads.txt com a linha oficial do Google', () => {
  assert.equal(adsTxt(SITE), 'google.com, pub-6982528073256938, DIRECT, f08c47fec0942fa0\n');
});

test('cliente inválido ou vazio desliga tudo', () => {
  for (const c of ['', 'pub-123', 'ca-pub-abc']) {
    const s = { ...site, adsenseClient: c };
    assert.equal(adsenseAtivo(s), false);
    assert.equal(scriptAdsense(s), '');
    assert.equal(anuncio(s, 'resultado'), '');
    assert.equal(adsTxt(s), '');
  }
});

test('espaço usa o bloco específico ou o padrão, com rótulo "Publicidade"', () => {
  assert.equal(slotDe(site, 'resultado'), '2222222222');
  assert.equal(slotDe(site, 'estatisticas'), '1111111111');
  assert.equal(slotDe(site, 'home-meio'), '1111111111');
  const html = anuncio(site, 'resultado');
  assert.ok(html.includes('data-ad-slot="2222222222"'));
  assert.ok(html.includes('data-ad-client="ca-pub-6982528073256938"'));
  assert.ok(html.includes('Publicidade'));
});

test('sem ID de bloco, o espaço não aparece (ficam só os anúncios automáticos)', () => {
  assert.equal(anuncio({ ...site, adsenseSlots: {} }, 'resultado'), '');
  assert.equal(anuncio({ ...site, adsenseSlots: { padrao: 'abc' } }, 'resultado'), '');
});

test('anúncios longe do botão "Comprar cota" da lotérica', () => {
  const build = readFileSync(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  // home: entre o bloco da lotérica e o anúncio existe a seção de ferramentas
  const iParc = build.indexOf("blocoParceiro(SITE.parceiro, { variante: 'home' })");
  const iAd = build.indexOf("anuncio('home-meio')");
  assert.ok(iParc > 0 && iAd > iParc);
  assert.ok(build.slice(iParc, iAd).includes('Ferramentas grátis'));
  // página de bolões: nenhum anúncio
  const boloes = build.slice(build.indexOf("salvar('/boloes'"), build.indexOf("salvar('/boloes'") + 6000);
  const fim = boloes.indexOf('salvar(', 10);
  assert.ok(!boloes.slice(0, fim > 0 ? fim : undefined).includes('anuncio('));
});
