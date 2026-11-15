// Pimba v1.4.0 — app: manifesto do PWA, service worker, assetlinks (TWA/Play Store) e "modo app".
// Usado pelo build (manifesto, sw.js) e pelo Worker (/.well-known/assetlinks.json). Sem dependências do Node.
//
// Regra da Play Store: app que não é operador licenciado de apostas não pode levar o usuário a comprar
// aposta ou cota com dinheiro. Por isso, dentro do app Android, tudo que tem data-fora-do-app some
// (botão "Comprar cota", WhatsApp de bolões da lotérica) e aparece o aviso .so-no-app no lugar.
// No site e no PWA instalado pelo navegador, nada muda.

export const ORIGEM_ANDROID = 'android'; // start_url do app Android: /?origem=android

const FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

export function fingerprintsValidos(app = {}) {
  const lista = (app.sha256 || []).map((f) => String(f).trim().toUpperCase()).filter(Boolean);
  for (const f of lista) {
    if (!FINGERPRINT.test(f)) throw new Error(`app.sha256 inválido (esperado 32 pares hexadecimais separados por ":"): ${f}`);
  }
  return [...new Set(lista)];
}

// Conteúdo de /.well-known/assetlinks.json. null = ainda sem impressão digital (responde 404).
export function assetLinks(app = {}) {
  const fps = fingerprintsValidos(app);
  if (!app.pacoteAndroid || !fps.length) return null;
  return [{
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: app.pacoteAndroid, sha256_cert_fingerprints: fps },
  }];
}

export function manifesto(site) {
  const app = site.app || {};
  const m = {
    id: '/',
    name: app.nome || site.nome,
    short_name: app.nomeCurto || site.nome,
    description: 'Resultados das loterias da CAIXA, conferidor de apostas, estatísticas, calendário de sorteios e chances reais.',
    lang: 'pt-BR',
    dir: 'ltr',
    start_url: '/?origem=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#101935',
    theme_color: '#101935',
    categories: ['entertainment', 'news', 'utilities'],
    icons: [
      { src: '/assets/img/app/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/img/app/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/assets/img/app/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/assets/img/app/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Resultados', url: '/resultados/', icons: [{ src: '/assets/img/app/icon-192.png', sizes: '192x192' }] },
      { name: 'Conferir meu jogo', short_name: 'Conferidor', url: '/conferidor/', icons: [{ src: '/assets/img/app/icon-192.png', sizes: '192x192' }] },
      { name: 'Gerador de números', short_name: 'Gerador', url: '/gerador/', icons: [{ src: '/assets/img/app/icon-192.png', sizes: '192x192' }] },
      { name: 'Calendário de sorteios', short_name: 'Calendário', url: '/calendario/', icons: [{ src: '/assets/img/app/icon-192.png', sizes: '192x192' }] },
    ],
  };
  if (app.pacoteAndroid && app.playStoreUrl) {
    m.related_applications = [{ platform: 'play', url: app.playStoreUrl, id: app.pacoteAndroid }];
    m.prefer_related_applications = false;
  }
  return m;
}

// Script inline no <head>: liga a classe "modo-app" antes de pintar a página (sem piscar o botão).
// O app Android abre em /?origem=android e o Chrome manda referrer android-app://<pacote>. A marca fica
// no sessionStorage da aba do app (não vaza para o Chrome comum, que não compartilha essa aba).
export function scriptModoApp(site) {
  const pacote = (site.app && site.app.pacoteAndroid) || '';
  return `<script>(function(){try{var d=document,s=sessionStorage,k='pimba-app';if(/[?&]origem=${ORIGEM_ANDROID}(&|$)/.test(location.search)||(${JSON.stringify(pacote)}&&d.referrer.indexOf('android-app://'+${JSON.stringify(pacote)})===0))s.setItem(k,'1');if(s.getItem(k))d.documentElement.classList.add('modo-app')}catch(e){}})()</script>`;
}

// Páginas que mostram resultado no próprio HTML: nunca saem do cache offline (evita resultado velho).
export const SEM_CACHE_OFFLINE = ['/resultados/', '/estatisticas/', '/api/'];

// Service worker. Estratégia:
// - /api/*, /resultados/*, /estatisticas/*: sempre da rede; sem internet, mostra /offline/ (nunca resultado velho)
// - outras páginas: rede primeiro; sem internet, a última cópia salva (conferidor, gerador, calendário...)
// - /assets/*: cache e atualiza em segundo plano (os arquivos levam ?v=<versão>)
// - outros domínios (AdSense, Analytics): o service worker não mexe
export function serviceWorker(versao) {
  return `// Pimba v${versao} — service worker (gerado por scripts/app.mjs)
const VERSAO = 'pimba-v${versao}';
const PRECACHE = ['/offline/', '/assets/css/style.css?v=${versao}', '/assets/js/app.js?v=${versao}', '/assets/img/favicon.svg', '/assets/img/app/icon-192.png', '/assets/fonts/outfit.woff2'];
const SEM_CACHE = ${JSON.stringify(SEM_CACHE_OFFLINE)};

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('pimba-') && n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

const offline = async () => (await caches.match('/offline/')) || new Response('Sem conexão', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/.well-known/')) return;

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(caches.open(VERSAO).then(async (c) => {
      const salvo = await c.match(req);
      const rede = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => salvo);
      return salvo || rede;
    }));
    return;
  }

  if (SEM_CACHE.some((p) => url.pathname.startsWith(p))) {
    if (req.mode === 'navigate') e.respondWith(fetch(req).catch(offline));
    return; // /api/: direto da rede; a página já mostra o aviso de erro
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok && !r.redirected) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
          return r;
        })
        .catch(async () => (await caches.match(req, { ignoreSearch: true })) || offline()),
    );
  }
});
`;
}
