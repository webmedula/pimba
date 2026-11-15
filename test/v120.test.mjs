// Pimba v1.2.0 — testes do bloco da lotérica parceira (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blocoParceiro, ldParceiro, linkCota, PORTAL_CAIXA } from '../scripts/parceiro.mjs';

const base = {
  ativo: true, nome: 'Lotérica Teste', razaoSocial: 'LOTERICA TESTE LTDA', cnpj: '00.000.000/0001-00',
  cidade: 'Goiânia/GO', endereco: 'Rua 1, 100', municipio: 'Goiânia', uf: 'GO', cep: '74000-000',
  horario: '', whatsapp: '', email: '', linkBoloesCaixa: '', grupoWhatsapp: '',
};

test('parceiro inativo ou sem nome não gera nada', () => {
  assert.equal(blocoParceiro({ ...base, ativo: false }), '');
  assert.equal(blocoParceiro({ ...base, nome: '' }), '');
  assert.equal(ldParceiro({ ...base, ativo: false }, 'https://x'), null);
});

test('sem link direto, o botão leva ao portal oficial e explica como escolher a lotérica', () => {
  const html = blocoParceiro(base);
  assert.equal(linkCota(base), PORTAL_CAIXA);
  assert.ok(html.includes(`href="${PORTAL_CAIXA}"`));
  assert.ok(html.includes('procure a lotérica <strong>Lotérica Teste</strong> (Goiânia/GO)'));
  assert.ok(!html.includes('aparece com o nome cadastrado'), 'sem nome diferente, sem aviso');
  assert.ok(html.includes('não vende cotas'));
  assert.ok(html.includes('menores de 18'));
  assert.ok(!html.includes('wa.me'), 'sem WhatsApp configurado, sem botão');
});

test('link direto só é aceito se for da CAIXA', () => {
  const ok = { ...base, linkBoloesCaixa: 'https://www.loteriasonline.caixa.gov.br/silce-web/#/boloes/123' };
  assert.ok(blocoParceiro(ok).includes(ok.linkBoloesCaixa));
  assert.throws(() => blocoParceiro({ ...base, linkBoloesCaixa: 'https://sorteonline.com.br/bolao' }), /caixa\.gov\.br/);
  assert.throws(() => blocoParceiro({ ...base, linkBoloesCaixa: 'https://caixa.gov.br.golpe.com/' }), /caixa\.gov\.br/);
});

test('WhatsApp, grupo e e-mail aparecem quando configurados; HTML escapado', () => {
  const html = blocoParceiro({ ...base, nome: 'A & B <Loterias>', whatsapp: '5562900000000', grupoWhatsapp: 'https://chat.whatsapp.com/abc', email: 'a@b.com' }, { variante: 'home' });
  assert.ok(html.includes('https://wa.me/5562900000000?text='));
  assert.ok(html.includes('https://chat.whatsapp.com/abc'));
  assert.ok(html.includes('mailto:a@b.com'));
  assert.ok(html.includes('A &amp; B &lt;Loterias&gt;'));
});

test('dados estruturados da lotérica', () => {
  const ld = ldParceiro({ ...base, whatsapp: '5562900000000' }, 'https://pimba.com.br');
  assert.equal(ld['@type'], 'Store');
  assert.equal(ld.taxID, base.cnpj);
  assert.equal(ld.telephone, '+5562900000000');
  assert.equal(ld.address.addressLocality, 'Goiânia');
});

test('v1.2.1: nome diferente no Loterias CAIXA vira instrução e aviso', () => {
  const p = { ...base, nomeNaCaixa: 'Nome Antigo Ltda' };
  for (const variante of ['boloes', 'home']) {
    const html = blocoParceiro(p, { variante });
    assert.ok(html.includes('procure a lotérica <strong>Nome Antigo Ltda</strong>'), variante);
    assert.ok(html.includes('aparece com o nome cadastrado <strong>Nome Antigo Ltda</strong>'), variante);
  }
  // com link direto, o aviso continua (o cliente vê o nome antigo na página da CAIXA)
  const direto = blocoParceiro({ ...p, linkBoloesCaixa: 'https://www.loteriasonline.caixa.gov.br/x' }, { variante: 'home' });
  assert.ok(direto.includes('aparece com o nome cadastrado'));
});
