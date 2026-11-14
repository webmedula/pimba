// Pimba v1.0.0 — comportamento comum a todas as páginas
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (btn && menu) {
  btn.addEventListener('click', () => {
    const aberto = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!aberto));
    menu.classList.toggle('aberto', !aberto);
  });
}
