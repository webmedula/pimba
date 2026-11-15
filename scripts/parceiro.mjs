// Pimba v1.2.0 — bloco da lotérica parceira (usado na home e em /boloes/).
// Regra: o Pimba NÃO vende cotas. Só divulga e manda o cliente para o canal oficial
// (portal/app Loterias CAIXA ou o balcão da lotérica), onde ele recebe o recibo oficial.
import { esc } from '../assets/js/render.js';

// Portal oficial de apostas on-line da CAIXA (usado quando não há link direto da lotérica).
export const PORTAL_CAIXA = 'https://www.loteriasonline.caixa.gov.br/silce-web/#/home';

export const zap = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

export const parceiroAtivo = (p) => Boolean(p && p.ativo && p.nome);

// Link do botão "comprar cota": o link direto da lotérica, se houver; senão, o portal oficial.
export const linkCota = (p) => (p.linkBoloesCaixa || PORTAL_CAIXA);

const soCaixa = (url) => /^https:\/\/([a-z0-9-]+\.)*caixa\.gov\.br\//i.test(url);

export const linkMapa = (p) =>
  p.endereco ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.nome}, ${p.endereco}, ${p.cidade || ''}`)}` : '';

// variante: 'boloes' (completo, com passo a passo) ou 'home' (resumido)
export function blocoParceiro(p, { variante = 'boloes' } = {}) {
  if (!parceiroAtivo(p)) return '';
  const cota = linkCota(p);
  if (!soCaixa(cota)) throw new Error(`parceiro.linkBoloesCaixa precisa ser um endereço oficial da CAIXA (*.caixa.gov.br): ${cota}`);
  const direto = Boolean(p.linkBoloesCaixa);
  const mapa = linkMapa(p);
  const local = [p.endereco, p.cidade].filter(Boolean).join(' — ');

  const fatos = `<ul class="fatos">
    ${local ? `<li><strong>Endereço:</strong> ${esc(local)}${mapa ? ` · <a href="${esc(mapa)}" target="_blank" rel="noopener">ver no mapa</a>` : ''}</li>` : ''}
    ${p.horario ? `<li><strong>Horário:</strong> ${esc(p.horario)}</li>` : ''}
    ${p.email ? `<li><strong>E-mail:</strong> <a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>` : ''}
  </ul>`;

  const botoes = `<div class="acoes">
    <a class="btn btn-primario" href="${esc(cota)}" target="_blank" rel="noopener nofollow" data-evento="cota-caixa">Comprar cota no Loterias CAIXA</a>
    ${p.whatsapp ? `<a class="btn btn-whats" href="${zap(p.whatsapp, 'Olá! Vim pelo Pimba e quero saber dos bolões desta semana.')}" target="_blank" rel="noopener">Ver bolões da semana no WhatsApp</a>` : ''}
    ${p.grupoWhatsapp ? `<a class="btn btn-sec" href="${esc(p.grupoWhatsapp)}" target="_blank" rel="noopener">Entrar no grupo de avisos</a>` : ''}
  </div>`;

  // Nome com que a lotérica aparece no portal/app Loterias CAIXA (pode ser diferente da fachada).
  const nomeCaixa = p.nomeNaCaixa || p.nome;
  const cidadeCaixa = p.cidade ? ` (${esc(p.cidade)})` : '';
  const alvo = `<strong>${esc(nomeCaixa)}</strong>${cidadeCaixa}`;
  const avisoNome = p.nomeNaCaixa && p.nomeNaCaixa !== p.nome
    ? `<p class="aviso-nome small"><strong>Atenção:</strong> no Loterias CAIXA, a ${esc(p.nome)} aparece com o nome cadastrado ${alvo}. É a mesma lotérica (mesmo CNPJ).</p>`
    : '';
  const dicaPortal = direto
    ? avisoNome
    : `<p class="small">No portal ou no app Loterias CAIXA, entre em <strong>Bolões</strong>, procure a lotérica ${alvo} e toque em <strong>Ver Bolões</strong>.</p>${avisoNome}`;

  const ident = [p.razaoSocial, p.cnpj && `CNPJ ${p.cnpj}`].filter(Boolean).join(', ');
  const rodape = `<p class="muted small">${esc(p.nome)}${ident ? ` (${esc(ident)})` : ''} é uma lotérica credenciada pela CAIXA. As cotas são vendidas pela própria lotérica, no balcão ou pelo canal oficial Loterias CAIXA, com recibo oficial. O Pimba não é a CAIXA, não vende cotas e não recebe pagamentos: apenas divulga. Proibido para menores de 18 anos.</p>`;

  if (variante === 'home') {
    return `<section class="secao">
  <div class="wrap">
    <div class="parceiro parceiro-home">
      <p class="selo">Lotérica parceira do Pimba</p>
      <h2>Bolões da ${esc(p.nome)}</h2>
      <p>Jogue com mais números pagando só uma cota. Compre pelo canal oficial da CAIXA e receba o recibo da sua cota no celular.</p>
      ${fatos}
      ${botoes}
      ${dicaPortal}
      <p class="small"><a href="/boloes/">Como funciona o bolão oficial →</a></p>
      ${rodape}
    </div>
  </div>
</section>`;
  }

  return `<section class="parceiro" id="loterica">
  <p class="selo">Lotérica parceira do Pimba</p>
  <h2>${esc(p.nome)}</h2>
  ${fatos}
  ${botoes}
  <h3>Como comprar sua cota</h3>
  <ol class="passos">
    <li>Toque em <strong>Comprar cota no Loterias CAIXA</strong>. Você vai para o portal oficial da CAIXA (ou use o app Loterias CAIXA).</li>
    <li>Entre com sua conta${direto ? '' : `, abra <strong>Bolões</strong>, procure a lotérica ${alvo} e toque em <strong>Ver Bolões</strong>`}. Dica: marque como favorita para achar mais rápido da próxima vez.</li>
    <li>Escolha o bolão e a quantidade de cotas e pague no próprio portal.</li>
    <li>O recibo da cota fica na sua conta. É ele que garante o seu prêmio.</li>
  </ol>
  ${avisoNome}
  <p class="small">Prefere ir pessoalmente? Compre no balcão da lotérica e leve o recibo na hora.</p>
  ${rodape}
</section>`;
}

// Dados estruturados (SEO local) da lotérica.
export function ldParceiro(p, siteUrl) {
  if (!parceiroAtivo(p)) return null;
  const ld = { '@context': 'https://schema.org', '@type': 'Store', name: p.nome, url: `${siteUrl}/boloes/#loterica` };
  if (p.razaoSocial) ld.legalName = p.razaoSocial;
  if (p.cnpj) ld.taxID = p.cnpj;
  if (p.email) ld.email = p.email;
  if (p.whatsapp) ld.telephone = `+${p.whatsapp}`;
  if (p.endereco) {
    ld.address = { '@type': 'PostalAddress', streetAddress: p.endereco, addressCountry: 'BR' };
    if (p.municipio) ld.address.addressLocality = p.municipio;
    if (p.uf) ld.address.addressRegion = p.uf;
    if (p.cep) ld.address.postalCode = p.cep;
  }
  return ld;
}
