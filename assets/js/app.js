// Pimba v1.5.0 — comportamento comum a todas as páginas
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (btn && menu) {
  btn.addEventListener('click', () => {
    const aberto = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!aberto));
    menu.classList.toggle('aberto', !aberto);
  });
}

// App (PWA): service worker e botão "Instalar o app" (só aparece quando o navegador permite instalar)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
const instalar = document.getElementById('instalar-app');
let pedido = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pedido = e;
  if (instalar && !document.documentElement.classList.contains('modo-app')) instalar.hidden = false;
});
instalar?.addEventListener('click', async () => {
  if (!pedido) return;
  pedido.prompt();
  await pedido.userChoice.catch(() => null);
  pedido = null;
  instalar.hidden = true;
});
window.addEventListener('appinstalled', () => { if (instalar) instalar.hidden = true; });
