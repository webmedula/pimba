// Pimba — configurações do site. Edite aqui e rode `npm run build` (o deploy no Cloudflare faz isso sozinho).

export const SITE = {
  nome: 'Pimba',
  url: 'https://pimba.com.br',
  versao: '1.6.1',
  slogan: 'Resultados das loterias, conferidor e bolões — sem enrolação.',
  // E-mail de contato (páginas Contato, Sobre, Privacidade e Termos). Precisa receber mensagens de verdade:
  // no Cloudflare, Email > Email Routing, encaminhe contato@pimba.com.br para a sua caixa pessoal.
  email: 'contato@pimba.com.br',

  // Lista de avisos no WhatsApp (link de grupo/comunidade ou wa.me). Vazio = botões escondidos.
  whatsappLista: '',

  // Lotérica parceira. Enquanto `ativo` for false, a home e a página de bolões mostram só o conteúdo geral.
  // Regra: o site NÃO vende cotas. Os botões levam ao canal oficial (portal/app Loterias CAIXA) ou ao WhatsApp da lotérica.
  parceiro: {
    ativo: true,
    nome: 'Sorte Milionária Loterias', // nome de exibição (confirmar com o parceiro)
    razaoSocial: 'SORTE MILIONARIA LOTERIAS LTDA',
    cnpj: '03.790.473/0001-28',
    cidade: 'Goiânia/GO',
    // Endereço do cadastro do CNPJ (Receita Federal, atualizado em 10/2026)
    endereco: 'Flamboyant Shopping, Av. Dep. Jamel Cecílio, 3300, piso 2, loja DS-04, Jardim Goiás',
    municipio: 'Goiânia',
    uf: 'GO',
    cep: '74810-100',
    horario: '', // ex.: seg a sáb 10h–22h, dom 14h–20h  (falta confirmar)
    whatsapp: '', // só números com DDI, ex.: 5562999999999  (falta)
    email: 'sortemilionaria@uol.com.br',
    // Link direto dos bolões da lotérica no Loterias CAIXA. Vazio = botão abre o portal oficial
    // com a instrução "entre em Bolões e escolha a lotérica". Só aceita endereços *.caixa.gov.br.
    linkBoloesCaixa: '',
    grupoWhatsapp: '', // link do grupo/comunidade de avisos de bolões da lotérica (falta)
    agenciaVinculacao: '1575', // uso interno, não aparece no site
  },

  // Monetização / métricas (vazio = desligado)
  adsenseClient: 'ca-pub-6982528073256938', // código de editor do AdSense (gera o script no <head> e o /ads.txt)
  // IDs dos blocos de anúncio criados no AdSense (Anúncios > Por bloco de anúncios > Display).
  // `padrao` vale para todos os espaços; os outros, se preenchidos, substituem o padrão naquele lugar.
  // Sem ID, o espaço não aparece e ficam só os anúncios automáticos (se ligados no painel do AdSense).
  adsenseSlots: {
    padrao: '',
    resultado: '', // abaixo do resultado de cada loteria
    estatisticas: '', // no meio das páginas de estatísticas
  },
  googleAnalyticsId: '', // ex.: G-XXXXXXXXXX

  // App Android (PWA empacotado como TWA para a Play Store). Passo a passo em docs/ANDROID.md.
  app: {
    nome: 'Pimba — Resultados das Loterias',
    nomeCurto: 'Pimba',
    pacoteAndroid: 'br.com.pimba.app', // identificador do app na Play Store (não muda depois de publicado)
    // Impressões digitais SHA-256 das chaves de assinatura do app (Play Console > Testar e lançar >
    // Integridade do app > Assinatura de apps). Cole as duas: "chave de assinatura do app" e "chave de upload".
    // Formato: 'AB:CD:EF:...' (32 pares). Vazio = /.well-known/assetlinks.json responde 404 e o app
    // abre com a barra de endereço do Chrome no topo até isso ser preenchido.
    sha256: [
      // 'COLE:AQUI:A:IMPRESSAO:DIGITAL:SHA-256:DA:PLAY:CONSOLE',
    ],
    playStoreUrl: '', // link da ficha na Play Store, quando publicado (mostra o botão "Baixe na Play Store")
  },
};
