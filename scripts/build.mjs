// Pimba — gerador do site estático. Uso: node scripts/build.mjs  → gera dist/
import { mkdirSync, rmSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/config.js';
import { LOTERIAS } from '../assets/js/loterias.js';
import { esc, brl, fmtInt } from '../assets/js/render.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const V = SITE.versao;
const ANO = new Date().getFullYear();

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });
const fonte = join(ROOT, 'node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2');
if (existsSync(fonte)) {
  mkdirSync(join(DIST, 'assets/fonts'), { recursive: true });
  cpSync(fonte, join(DIST, 'assets/fonts/outfit.woff2'));
}

const paginas = []; // para o sitemap

function salvar(rota, html, { sitemap = true, prioridade = '0.6' } = {}) {
  const arq = rota === '/404' ? join(DIST, '404.html') : join(DIST, rota, 'index.html');
  mkdirSync(dirname(arq), { recursive: true });
  writeFileSync(arq, html);
  if (sitemap) paginas.push({ rota, prioridade });
}

const zap = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

// ---------- componentes ----------
const NAV = [
  ['/resultados/', 'Resultados'],
  ['/conferidor/', 'Conferidor'],
  ['/gerador/', 'Gerador'],
  ['/boloes/', 'Bolões'],
  ['/probabilidades/', 'Chances'],
];

const anuncio = (posicao) =>
  SITE.adsenseClient
    ? `<div class="ad-slot" data-pos="${posicao}"><ins class="adsbygoogle" style="display:block" data-ad-client="${SITE.adsenseClient}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`
    : '';

const ctaWhats = () =>
  SITE.whatsappLista
    ? `<section class="cta-whats"><div class="wrap"><div><h2>Resultado no seu WhatsApp</h2><p>Receba os números assim que saírem e os bolões da semana. Sem spam.</p></div><a class="btn btn-whats" href="${esc(SITE.whatsappLista)}" target="_blank" rel="noopener">Quero receber</a></div></section>`
    : '';

function layout({ titulo, descricao, rota, corpo, scripts = [], extraHead = '', robots = 'index,follow', ogTipo = 'website' }) {
  const canonical = `${SITE.url}${rota}`;
  const navHtml = NAV.map(([href, txt]) => `<a href="${href}"${rota.startsWith(href) ? ' aria-current="page"' : ''}>${txt}</a>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${ogTipo}">
<meta property="og:site_name" content="Pimba">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.url}/assets/img/og.png">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#101935">
<meta name="generator" content="Pimba v${V}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css?v=${V}">
${SITE.googleAnalyticsId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.googleAnalyticsId}');</script>` : ''}
${SITE.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>` : ''}
${extraHead}
</head>
<body>
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <div class="wrap topo-in">
    <a class="logo" href="/" aria-label="Pimba — página inicial"><span class="logo-bola" aria-hidden="true">P</span><span class="logo-txt">pimba<b>!</b></span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span></span><span></span><span></span></button>
    <nav id="menu" class="menu" aria-label="Principal">${navHtml}</nav>
  </div>
</header>
<main id="conteudo">
${corpo}
</main>
${ctaWhats()}
<footer class="rodape">
  <div class="wrap rodape-grid">
    <div>
      <a class="logo logo-rodape" href="/"><span class="logo-bola" aria-hidden="true">P</span><span class="logo-txt">pimba<b>!</b></span></a>
      <p>${esc(SITE.slogan)}</p>
      <p class="aviso-18"><strong>18+</strong> Jogue com responsabilidade.</p>
    </div>
    <div>
      <h2>Resultados</h2>
      <ul>${LOTERIAS.map((l) => `<li><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Ferramentas</h2>
      <ul>
        <li><a href="/conferidor/">Conferidor de apostas</a></li>
        <li><a href="/gerador/">Gerador de números</a></li>
        <li><a href="/probabilidades/">Chances de ganhar</a></li>
        <li><a href="/boloes/">Bolões</a></li>
      </ul>
    </div>
    <div>
      <h2>Pimba</h2>
      <ul>
        <li><a href="/sobre/">Sobre e contato</a></li>
        <li><a href="/jogo-responsavel/">Jogo responsável</a></li>
        <li><a href="/privacidade/">Privacidade</a></li>
        <li><a href="/termos/">Termos de uso</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap rodape-legal">
    <p>O Pimba é um site independente de informação. <strong>Não é a CAIXA, não vende apostas e não tem vínculo com as Loterias CAIXA.</strong> Resultados obtidos das fontes oficiais; confira sempre no canal oficial antes de descartar seu bilhete.</p>
    <p>© ${ANO} Pimba · v${V}</p>
  </div>
</footer>
<script type="module" src="/assets/js/app.js?v=${V}"></script>
${scripts.map((s) => `<script type="module" src="/assets/js/${s}?v=${V}"></script>`).join('\n')}
</body>
</html>`;
}

const migalhas = (itens) => {
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: itens.map(([nome, rota], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: `${SITE.url}${rota}` })),
  };
  return `<nav class="migalhas" aria-label="Você está em"><ol>${itens
    .map(([nome, rota], i) => (i < itens.length - 1 ? `<li><a href="${rota}">${esc(nome)}</a></li>` : `<li aria-current="page">${esc(nome)}</li>`))
    .join('')}</ol></nav><script type="application/ld+json">${JSON.stringify(ld)}</script>`;
};

const chips = (atual = '') =>
  `<div class="chips">${LOTERIAS.map((l) => `<a class="chip${l.slug === atual ? ' ativo' : ''}" style="--cor:${l.cor}" href="/resultados/${l.slug}/">${esc(l.nome)}</a>`).join('')}</div>`;

const tabelaOdds = (l) =>
  `<table class="tabela"><thead><tr><th>Faixa</th><th>Chance (aposta mínima)</th></tr></thead><tbody>${l.odds
    .map(([f, o]) => `<tr><td>${esc(f)}</td><td>1 em ${fmtInt(o)}</td></tr>`)
    .join('')}</tbody></table>`;

// ---------- HOME ----------
const faqHome = [
  ['Que horas saem os resultados das loterias?', 'Os sorteios da CAIXA acontecem normalmente às 20h (horário de Brasília), no Espaço da Sorte, em São Paulo. O Pimba atualiza os resultados minutos depois da divulgação oficial.'],
  ['O Pimba vende apostas?', 'Não. O Pimba é um site de informação: resultados, conferidor e ferramentas. Apostas e cotas de bolão oficiais são vendidas apenas nas lotéricas e nos canais da CAIXA (portal e aplicativo Loterias CAIXA).'],
  ['Qual a loteria mais fácil de ganhar?', 'Pela matemática, a chance de acertar o prêmio principal é maior no Dia de Sorte (1 em 2,6 milhões) e na Lotofácil (1 em 3,3 milhões). A Mega-Sena é 1 em 50 milhões. Veja a comparação completa na página de chances.'],
  ['Existe método para ganhar na loteria?', 'Não. Cada sorteio é independente e todas as combinações têm a mesma chance. Desconfie de quem vende "método garantido". O que muda a chance é apenas a quantidade de combinações que você joga.'],
];

salvar('/', layout({
  titulo: 'Pimba — Resultados da Mega-Sena, Lotofácil, Quina e todas as loterias',
  descricao: 'Resultados das loterias da CAIXA atualizados: Mega-Sena, Lotofácil, Quina, +Milionária e mais. Confira sua aposta, gere números e veja as chances reais de ganhar.',
  rota: '/',
  scripts: ['home.js'],
  extraHead: `<script type="application/ld+json">${JSON.stringify([
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Pimba', url: SITE.url, inLanguage: 'pt-BR' },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqHome.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ])}</script>`,
  corpo: `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="selo">Atualizado minutos após cada sorteio</p>
      <h1>Saiu o resultado?<br><span>Pimba, tá aqui.</span></h1>
      <p class="hero-sub">Todas as loterias da CAIXA num lugar só. Confira seu jogo em segundos, veja quanto pagou cada faixa e quanto está acumulado.</p>
      <div class="hero-ctas">
        <a class="btn btn-primario" href="/conferidor/">Conferir meu jogo</a>
        <a class="btn btn-sec" href="/resultados/">Ver todos os resultados</a>
      </div>
    </div>
    <aside class="hero-destaque" id="maior-premio" aria-live="polite">
      <p class="hd-label">Maior prêmio em jogo</p>
      <p class="hd-valor">—</p>
      <p class="hd-info">Carregando…</p>
    </aside>
  </div>
</section>

<section class="secao">
  <div class="wrap">
    <div class="secao-topo"><h2>Últimos resultados</h2><a href="/resultados/">Todas as loterias →</a></div>
    <div class="grid-res" id="home-resultados">
      ${LOTERIAS.map((l) => `<article class="card-res esqueleto" style="--cor:${l.cor}"><header><h3><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></h3></header><p class="muted">Carregando…</p></article>`).join('')}
    </div>
  </div>
</section>

${anuncio('home-meio')}

<section class="secao secao-alt">
  <div class="wrap">
    <h2>Ferramentas grátis</h2>
    <div class="grid-ferr">
      <a class="ferr" href="/conferidor/"><span class="ferr-ico" aria-hidden="true">✓</span><h3>Conferidor</h3><p>Marque seus números e veja na hora quantos acertou e quanto pagou.</p></a>
      <a class="ferr" href="/gerador/"><span class="ferr-ico" aria-hidden="true">🎲</span><h3>Gerador de números</h3><p>Sem ideia de números? Gere jogos aleatórios para qualquer loteria.</p></a>
      <a class="ferr" href="/probabilidades/"><span class="ferr-ico" aria-hidden="true">%</span><h3>Chances reais</h3><p>Qual loteria é mais fácil? A matemática de cada uma, sem promessa.</p></a>
      <a class="ferr" href="/boloes/"><span class="ferr-ico" aria-hidden="true">👥</span><h3>Bolões</h3><p>Jogue com mais combinações pagando só uma cota. Veja como funciona.</p></a>
    </div>
  </div>
</section>

<section class="secao">
  <div class="wrap faq">
    <h2>Perguntas frequentes</h2>
    ${faqHome.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
  </div>
</section>
`,
}), { prioridade: '1.0' });

// ---------- RESULTADOS (índice) ----------
salvar('/resultados', layout({
  titulo: 'Resultados das loterias da CAIXA hoje | Pimba',
  descricao: 'Últimos resultados de todas as loterias da CAIXA: Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária, Federal e Loteca.',
  rota: '/resultados/',
  scripts: ['home.js'],
  corpo: `
<section class="secao">
  <div class="wrap">
    ${migalhas([['Início', '/'], ['Resultados', '/resultados/']])}
    <h1>Resultados das loterias</h1>
    <p class="lead">O último concurso de cada modalidade. Clique para ver prêmios por faixa, ganhadores e concursos anteriores.</p>
    <div class="grid-res" id="home-resultados">
      ${LOTERIAS.map((l) => `<article class="card-res esqueleto" style="--cor:${l.cor}"><header><h3><a href="/resultados/${l.slug}/">${esc(l.nome)}</a></h3></header><p class="muted">Carregando…</p></article>`).join('')}
    </div>
  </div>
</section>`,
}), { prioridade: '0.9' });

// ---------- RESULTADOS (uma por loteria) ----------
for (const l of LOTERIAS) {
  const rota = `/resultados/${l.slug}/`;
  const temConferidor = l.tipo === 'dezenas' || l.tipo === 'colunas';
  salvar(rota, layout({
    titulo: `Resultado da ${l.nome} — último concurso | Pimba`,
    descricao: `Resultado da ${l.nome} do último concurso: números sorteados, ganhadores, prêmios por faixa e estimativa do próximo sorteio. Veja também como jogar e as chances.`,
    rota,
    scripts: ['resultado.js'],
    corpo: `
<section class="secao">
  <div class="wrap layout-2">
    <div>
      ${migalhas([['Início', '/'], ['Resultados', '/resultados/'], [l.nome, rota]])}
      <h1 style="--cor:${l.cor}" class="h1-lot">Resultado da ${esc(l.nome)}<span class="h1-concurso"></span></h1>
      <div id="resultado" class="resultado" data-slug="${l.slug}" aria-live="polite">
        <div class="carregando"><span></span><span></span><span></span> Buscando o resultado…</div>
      </div>
      ${anuncio('resultado')}
      <section class="como-jogar">
        <h2>Como jogar na ${esc(l.nome)}</h2>
        <p>${esc(l.regra)}</p>
        <ul class="fatos">
          ${l.preco ? `<li><strong>Aposta mínima:</strong> ${brl(l.preco)}</li>` : ''}
          <li><strong>Sorteios:</strong> ${esc(l.dias)}</li>
          <li><strong>Onde jogar:</strong> lotéricas e portal/aplicativo Loterias CAIXA</li>
        </ul>
        <h3>Chances de ganhar</h3>
        ${tabelaOdds(l)}
        <p class="muted small">Valores e dias podem mudar; a referência é sempre o site oficial das Loterias CAIXA.</p>
      </section>
    </div>
    <aside class="lateral">
      ${temConferidor ? `<a class="box-acao" style="--cor:${l.cor}" href="/conferidor/?l=${l.slug}"><strong>Conferir meu jogo</strong><span>Marque seus números e veja os acertos</span></a>
      <a class="box-acao box-acao-sec" href="/gerador/?l=${l.slug}"><strong>Gerar números</strong><span>Palpites aleatórios para a ${esc(l.nome)}</span></a>` : ''}
      <a class="box-acao box-acao-sec" href="/boloes/"><strong>Jogar em bolão</strong><span>Mais combinações, custo dividido</span></a>
      <div class="box-outras"><h2>Outras loterias</h2>${chips(l.slug)}</div>
    </aside>
  </div>
</section>`,
  }), { prioridade: '0.9' });
}

// ---------- CONFERIDOR ----------
const conferiveis = LOTERIAS.filter((l) => l.tipo === 'dezenas' || l.tipo === 'colunas');
salvar('/conferidor', layout({
  titulo: 'Conferidor de apostas — Mega-Sena, Lotofácil, Quina e mais | Pimba',
  descricao: 'Confira sua aposta grátis: marque os números do seu jogo, escolha o concurso e veja na hora quantos acertou e quanto pagou cada faixa.',
  rota: '/conferidor/',
  scripts: ['conferidor.js'],
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Conferidor', '/conferidor/']])}
    <h1>Conferidor de apostas</h1>
    <p class="lead">Escolha a loteria, marque os números que você jogou e confira. O último concurso já vem selecionado.</p>
    <div class="ferramenta" id="conferidor">
      <fieldset class="seletor-lot"><legend>Loteria</legend>
        ${conferiveis.map((l, i) => `<label class="opt-lot" style="--cor:${l.cor}"><input type="radio" name="lot" value="${l.slug}"${i === 0 ? ' checked' : ''}><span>${esc(l.nome)}</span></label>`).join('')}
      </fieldset>
      <div class="linha-campos">
        <label>Concurso <input type="number" id="conf-concurso" min="1" inputmode="numeric" placeholder="Último"></label>
        <p class="contador" id="conf-contador" aria-live="polite"></p>
      </div>
      <div id="conf-grade" class="grade" role="group" aria-label="Seus números"></div>
      <div id="conf-trevos" class="grade grade-trevos" role="group" aria-label="Seus trevos" hidden></div>
      <div class="acoes">
        <button class="btn btn-primario" id="conf-ok" type="button">Conferir</button>
        <button class="btn btn-sec" id="conf-limpar" type="button">Limpar</button>
      </div>
      <div id="conf-saida" aria-live="polite"></div>
    </div>
    ${anuncio('conferidor')}
    <p class="muted small">O conferidor é uma ajuda. O resultado que vale é o oficial da CAIXA, conferido na lotérica ou no app Loterias CAIXA.</p>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- GERADOR ----------
const geraveis = LOTERIAS.filter((l) => l.tipo === 'dezenas' || l.tipo === 'colunas');
salvar('/gerador', layout({
  titulo: 'Gerador de números para loterias — Mega-Sena, Lotofácil e mais | Pimba',
  descricao: 'Gere números aleatórios para Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete e +Milionária. Grátis e sem cadastro.',
  rota: '/gerador/',
  scripts: ['gerador.js'],
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Gerador de números', '/gerador/']])}
    <h1>Gerador de números</h1>
    <p class="lead">Sorteio aleatório de verdade (gerador criptográfico do seu navegador). Útil quando bate a dúvida na hora de marcar o volante.</p>
    <div class="ferramenta" id="gerador">
      <fieldset class="seletor-lot"><legend>Loteria</legend>
        ${geraveis.map((l, i) => `<label class="opt-lot" style="--cor:${l.cor}"><input type="radio" name="lot" value="${l.slug}"${i === 0 ? ' checked' : ''}><span>${esc(l.nome)}</span></label>`).join('')}
      </fieldset>
      <div class="linha-campos">
        <label>Números por jogo <select id="ger-qtd"></select></label>
        <label>Quantos jogos <select id="ger-jogos">${[1, 2, 3, 4, 5, 10].map((n) => `<option>${n}</option>`).join('')}</select></label>
      </div>
      <div class="acoes">
        <button class="btn btn-primario" id="ger-ok" type="button">Gerar números</button>
        <button class="btn btn-sec" id="ger-copiar" type="button" hidden>Copiar jogos</button>
      </div>
      <div id="ger-saida" aria-live="polite"></div>
    </div>
    ${anuncio('gerador')}
    <div class="aviso">
      <strong>Sem ilusão:</strong> números gerados aleatoriamente têm exatamente a mesma chance de qualquer outra combinação. Nenhum gerador, método ou "inteligência artificial" aumenta sua probabilidade de ganhar. <a href="/probabilidades/">Veja as chances reais</a>.
    </div>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- BOLÕES ----------
const p = SITE.parceiro;
const blocoParceiro = p.ativo && p.nome
  ? `<section class="parceiro">
  <p class="selo">Lotérica parceira do Pimba</p>
  <h2>${esc(p.nome)}</h2>
  <ul class="fatos">
    ${p.cidade ? `<li><strong>Cidade:</strong> ${esc(p.cidade)}</li>` : ''}
    ${p.endereco ? `<li><strong>Endereço:</strong> ${esc(p.endereco)}</li>` : ''}
    ${p.horario ? `<li><strong>Horário:</strong> ${esc(p.horario)}</li>` : ''}
  </ul>
  <div class="acoes">
    ${p.linkBoloesCaixa ? `<a class="btn btn-primario" href="${esc(p.linkBoloesCaixa)}" target="_blank" rel="noopener">Ver bolões no Loterias CAIXA</a>` : ''}
    ${p.whatsapp ? `<a class="btn btn-whats" href="${zap(p.whatsapp, 'Olá! Vim pelo Pimba e quero saber dos bolões desta semana.')}" target="_blank" rel="noopener">Falar no WhatsApp</a>` : ''}
  </div>
  <p class="muted small">Cotas vendidas pela própria lotérica, com recibo oficial da CAIXA. O Pimba apenas divulga.</p>
</section>`
  : '';

salvar('/boloes', layout({
  titulo: 'Bolão da Mega-Sena, Lotofácil e Quina: como funciona | Pimba',
  descricao: 'Entenda como funciona o bolão oficial das loterias CAIXA: cotas, recibo, tarifa de serviço, onde comprar com segurança e como dividir o prêmio.',
  rota: '/boloes/',
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Bolões', '/boloes/']])}
    <h1>Bolões: jogue mais, pague uma cota</h1>
    <p class="lead">No bolão, várias pessoas dividem o custo de um jogo com mais números. Você paga uma cota e concorre com todas as combinações do bolão. Se ganhar, o prêmio é dividido entre as cotas.</p>
    ${blocoParceiro}
    <h2>Como funciona o Bolão CAIXA</h2>
    <ul class="lista-check">
      <li>O bolão é montado por uma <strong>lotérica credenciada</strong> e registrado no sistema da CAIXA.</li>
      <li>Cada participante recebe um <strong>recibo de cota oficial</strong>, que é o comprovante para retirar o prêmio.</li>
      <li>A CAIXA define número mínimo e máximo de cotas e valores mínimos por modalidade.</li>
      <li>A lotérica pode cobrar uma <strong>tarifa de serviço</strong> sobre o valor da cota (limitada pelas regras da CAIXA).</li>
      <li>O prêmio é dividido igualmente entre as cotas e cada um saca a sua parte com o próprio recibo.</li>
    </ul>
    <h2>Onde comprar com segurança</h2>
    <ul class="lista-check">
      <li><strong>Na lotérica:</strong> você escolhe o bolão no balcão e leva o recibo na hora.</li>
      <li><strong>Pela internet, no canal oficial:</strong> o portal e o aplicativo Loterias CAIXA vendem cotas de bolões montados pelas lotéricas, com recibo individual.</li>
    </ul>
    <div class="aviso">
      <strong>Cuidado com golpes:</strong> só compre cotas com recibo oficial da CAIXA. Grupos de WhatsApp, perfis e sites que "vendem bolão" por Pix sem esse recibo não garantem o seu prêmio. Rifas e sorteios sem autorização do governo também são ilegais no Brasil.
    </div>
    <h2>Vale a pena?</h2>
    <p>O bolão não muda a matemática: cada combinação continua com a mesma chance. O que ele faz é permitir que você participe de um jogo com mais números (por exemplo, uma Mega-Sena de 9 ou 10 dezenas) pagando uma fração do preço. Em troca, se ganhar, divide o prêmio. É uma boa forma de jogar em grupo — família, trabalho, amigos — gastando pouco.</p>
    <p><a href="/probabilidades/">Veja quanto cada número a mais aumenta suas chances →</a></p>
  </div>
</section>`,
}), { prioridade: '0.8' });

// ---------- PROBABILIDADES ----------
const comparaveis = LOTERIAS.filter((l) => l.preco);
const ordenadas = [...comparaveis].sort((a, b) => a.odds[0][1] - b.odds[0][1]);
salvar('/probabilidades', layout({
  titulo: 'Qual loteria é mais fácil de ganhar? Chances reais de cada uma | Pimba',
  descricao: 'Compare as chances reais de ganhar em cada loteria da CAIXA: Dia de Sorte, Lotofácil, Mega-Sena, Quina, +Milionária e outras. Matemática pura, sem promessa.',
  rota: '/probabilidades/',
  corpo: `
<section class="secao">
  <div class="wrap estreito">
    ${migalhas([['Início', '/'], ['Chances de ganhar', '/probabilidades/']])}
    <h1>Qual loteria é mais fácil de ganhar?</h1>
    <p class="lead">Ranking pela chance de acertar o prêmio principal com a aposta mínima. Quanto menor o número, mais fácil.</p>
    <div class="tabela-rolagem">
    <table class="tabela ranking"><thead><tr><th>#</th><th>Loteria</th><th>Chance do prêmio principal</th><th>Aposta mínima</th></tr></thead><tbody>
      ${ordenadas.map((l, i) => `<tr><td>${i + 1}</td><td><a href="/resultados/${l.slug}/" style="--cor:${l.cor}" class="ponto">${esc(l.nome)}</a></td><td>1 em ${fmtInt(l.odds[0][1])}</td><td>${brl(l.preco)}</td></tr>`).join('')}
    </tbody></table>
    </div>
    <p class="muted small">Loteria Federal: o 1º prêmio sai para 1 bilhete em 100.000 números, mas o preço varia por extração.</p>
    ${anuncio('probabilidades')}
    <h2>O que muda a sua chance (e o que não muda)</h2>
    <ul class="lista-check">
      <li><strong>Muda:</strong> jogar mais combinações. Uma Mega-Sena com 7 números equivale a 7 jogos de 6, e custa 7 vezes mais. Participar de bolões é a forma barata de fazer isso.</li>
      <li><strong>Não muda:</strong> escolher números "atrasados", "quentes", datas, sequências ou palpites de inteligência artificial. Cada sorteio é independente; as bolas não têm memória.</li>
      <li><strong>Dica que ajuda de verdade:</strong> fugir de combinações populares (1-2-3-4-5-6, datas de aniversário) não aumenta a chance de ganhar, mas diminui a chance de dividir o prêmio com muita gente.</li>
    </ul>
    <h2>Chances por faixa em cada loteria</h2>
    ${comparaveis.map((l) => `<details class="det-odds"><summary style="--cor:${l.cor}">${esc(l.nome)}</summary>${tabelaOdds(l)}</details>`).join('')}
  </div>
</section>`,
}), { prioridade: '0.7' });

// ---------- PÁGINAS INSTITUCIONAIS ----------
const pagTexto = (rota, titulo, descricao, h1, html) =>
  salvar(rota, layout({
    titulo: `${titulo} | Pimba`, descricao, rota: `${rota}/`,
    corpo: `<section class="secao"><div class="wrap estreito texto">${migalhas([['Início', '/'], [h1, `${rota}/`]])}<h1>${esc(h1)}</h1>${html}</div></section>`,
  }), { prioridade: '0.3' });

pagTexto('/sobre', 'Sobre o Pimba', 'O Pimba é um site independente com resultados das loterias, conferidor e ferramentas grátis.', 'Sobre o Pimba', `
<p>O Pimba nasceu para ser o jeito mais rápido de saber se você ganhou: resultado na tela, conferidor fácil e informação honesta sobre as chances de cada loteria.</p>
<p>Somos um site <strong>independente</strong>. Não somos a CAIXA, não vendemos apostas e não temos vínculo com as Loterias CAIXA. Os resultados vêm das fontes oficiais e são exibidos minutos após cada sorteio.</p>
<h2>Contato</h2>
${SITE.email ? `<p>E-mail: <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></p>` : ''}
${SITE.parceiro.ativo && SITE.parceiro.whatsapp ? `<p>WhatsApp: <a href="${zap(SITE.parceiro.whatsapp, 'Olá! Vim pelo site do Pimba.')}" target="_blank" rel="noopener">fale com a gente</a></p>` : ''}
<p>Encontrou um erro em algum resultado? Avise — corrigimos na hora.</p>`);

pagTexto('/jogo-responsavel', 'Jogo responsável', 'Loteria é diversão. Veja como jogar com responsabilidade e onde buscar ajuda.', 'Jogo responsável', `
<p>Loteria é entretenimento, não investimento nem fonte de renda. As chances de ganhar o prêmio principal são muito pequenas — na Mega-Sena, 1 em 50 milhões por aposta simples.</p>
<ul class="lista-check">
  <li>Apostas são proibidas para menores de 18 anos.</li>
  <li>Defina um valor por mês que não faça falta e não passe dele.</li>
  <li>Nunca jogue para recuperar dinheiro perdido ou pagar dívidas.</li>
  <li>Desconfie de qualquer promessa de "método garantido".</li>
  <li>Se o jogo está tirando seu sono, seu dinheiro ou sua paz, peça ajuda. O CVV atende 24h pelo 188, e o SUS oferece apoio nos CAPS.</li>
</ul>`);

pagTexto('/privacidade', 'Política de privacidade', 'Como o Pimba trata seus dados, conforme a LGPD.', 'Política de privacidade', `
<p>Última atualização: versão ${V}.</p>
<h2>O que coletamos</h2>
<p>O Pimba não exige cadastro. Os números que você digita no conferidor e no gerador ficam apenas no seu navegador e não são enviados a nós.</p>
<p>Podemos usar ferramentas de terceiros que utilizam cookies: <strong>Google Analytics</strong> (estatísticas de visitas, de forma agregada) e <strong>Google AdSense</strong> (exibição de anúncios, que pode ser personalizada com base na sua navegação). Você pode gerenciar a personalização de anúncios em <a href="https://adssettings.google.com" rel="noopener" target="_blank">adssettings.google.com</a> e bloquear cookies no seu navegador.</p>
<h2>Contatos por WhatsApp</h2>
<p>Se você entrar na nossa lista ou falar conosco pelo WhatsApp, seu número é usado apenas para enviar o que você pediu. Você pode sair a qualquer momento.</p>
<h2>Seus direitos (LGPD)</h2>
<p>Você pode pedir acesso, correção ou exclusão dos seus dados pelos nossos canais de contato na página <a href="/sobre/">Sobre</a>.</p>`);

pagTexto('/termos', 'Termos de uso', 'Termos de uso do site Pimba.', 'Termos de uso', `
<p>Ao usar o Pimba você concorda com estes termos.</p>
<ul class="lista-check">
  <li>O Pimba é informativo. Os resultados são obtidos de fontes oficiais, mas podem conter atrasos ou erros: <strong>o resultado válido é sempre o oficial da CAIXA</strong>.</li>
  <li>O Pimba não vende apostas, não intermedeia jogos e não recebe valores de apostas.</li>
  <li>O gerador de números é aleatório e não aumenta chances de ganhar.</li>
  <li>Marcas e nomes das loterias pertencem aos seus titulares e são citados apenas para identificação.</li>
  <li>Conteúdo para maiores de 18 anos.</li>
</ul>`);

// ---------- 404 ----------
salvar('/404', layout({
  titulo: 'Página não encontrada | Pimba', descricao: 'Página não encontrada.', rota: '/404', robots: 'noindex',
  corpo: `<section class="secao"><div class="wrap estreito centro"><p class="numero-404">404</p><h1>Essa não saiu</h1><p class="lead">A página que você procurou não existe (ou mudou de lugar com a reforma do site).</p><div class="acoes centro"><a class="btn btn-primario" href="/resultados/">Ver resultados</a><a class="btn btn-sec" href="/">Ir para o início</a></div>${chips()}</div></section>`,
}), { sitemap: false });

// ---------- arquivos de apoio ----------
const hoje = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map((pg) => `  <url><loc>${SITE.url}${pg.rota === '/' ? '/' : `${pg.rota.replace(/\/$/, '')}/`}</loc><lastmod>${hoje}</lastmod><priority>${pg.prioridade}</priority></url>`).join('\n')}
</urlset>
`);

writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`);

if (SITE.adsenseClient) {
  writeFileSync(join(DIST, 'ads.txt'), `google.com, ${SITE.adsenseClient.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`);
}

// Redirecionamentos do WordPress/WooCommerce antigo
writeFileSync(join(DIST, '_redirects'), `/shop / 301
/shop/* / 301
/loja / 301
/loja/* / 301
/cart / 301
/carrinho / 301
/checkout / 301
/finalizar-compra / 301
/my-account / 301
/minha-conta / 301
/minha-conta/* / 301
/produto/* / 301
/product/* / 301
/categoria-produto/* / 301
/product-category/* / 301
/cursos / 301
/cursos/* / 301
/curso/* / 301
/feed / 301
/wp-login.php / 301
/wp-admin / 301
/wp-admin/* / 301
/resultados /resultados/ 301
/conferidor /conferidor/ 301
/gerador /gerador/ 301
`);

writeFileSync(join(DIST, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN

/assets/*
  Cache-Control: public, max-age=3600

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);

writeFileSync(join(DIST, 'version.txt'), `Pimba v${V}\n`);
console.log(`Pimba v${V}: ${paginas.length} páginas geradas em dist/`);
