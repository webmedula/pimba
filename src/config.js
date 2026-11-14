// Pimba — configurações do site. Edite aqui e rode `npm run build` (o deploy no Cloudflare faz isso sozinho).

export const SITE = {
  nome: 'Pimba',
  url: 'https://pimba.com.br',
  versao: '1.0.0',
  slogan: 'Resultados das loterias, conferidor e bolões — sem enrolação.',
  email: '', // ex.: contato@pimba.com.br (deixe vazio para esconder)

  // Lista de avisos no WhatsApp (link de grupo/comunidade ou wa.me). Vazio = botões escondidos.
  whatsappLista: '',

  // Lotérica parceira. Enquanto `ativo` for false, a página de bolões mostra só o conteúdo geral.
  parceiro: {
    ativo: false,
    nome: '', // ex.: Lotérica Sorte Grande
    cidade: '', // ex.: Goiânia/GO
    endereco: '',
    horario: '', // ex.: seg a sex 8h–18h, sáb 8h–13h
    whatsapp: '', // só números com DDI, ex.: 5562999999999
    // Link da página de bolões da lotérica no Loterias CAIXA (canal oficial de venda online de cotas)
    linkBoloesCaixa: '',
  },

  // Monetização / métricas (vazio = desligado)
  adsenseClient: '', // ex.: ca-pub-1234567890123456
  googleAnalyticsId: '', // ex.: G-XXXXXXXXXX
};
