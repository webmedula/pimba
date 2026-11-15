// Pimba v1.3.0 — Google AdSense: script do <head>, espaços de anúncio e ads.txt.
// Regra: anúncio nunca na página de bolões nem colado no bloco da lotérica parceira (botão "Comprar cota").

const CLIENTE_OK = /^ca-pub-\d{10,20}$/;
const SLOT_OK = /^\d{6,20}$/;

export function adsenseAtivo(site) {
  return CLIENTE_OK.test(site.adsenseClient || '');
}

// Script do AdSense para o <head> (o mesmo código que o painel do AdSense entrega).
export function scriptAdsense(site) {
  if (!adsenseAtivo(site)) return '';
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}" crossorigin="anonymous"></script>`;
}

// ID do bloco para uma posição: o específico (ex.: `resultado`) ou o `padrao`.
export function slotDe(site, posicao) {
  const slots = site.adsenseSlots || {};
  const id = String(slots[posicao] || slots.padrao || '').trim();
  return SLOT_OK.test(id) ? id : '';
}

// Espaço de anúncio responsivo. Sem cliente ou sem ID de bloco, não gera nada.
export function anuncio(site, posicao) {
  if (!adsenseAtivo(site)) return '';
  const slot = slotDe(site, posicao);
  if (!slot) return '';
  return `<aside class="ad-slot" data-pos="${posicao}" aria-label="Publicidade"><p class="ad-rotulo">Publicidade</p><ins class="adsbygoogle" style="display:block" data-ad-client="${site.adsenseClient}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></aside>`;
}

// Linha do ads.txt (autoriza o Google a vender anúncios no domínio).
export function adsTxt(site) {
  if (!adsenseAtivo(site)) return '';
  return `google.com, ${site.adsenseClient.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}
