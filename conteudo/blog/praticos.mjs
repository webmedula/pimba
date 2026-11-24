// Pimba v1.6.0 — artigos do blog: bolão, conferir, receber prêmio, golpes e jogo responsável.
import { POR_SLUG } from '../../assets/js/loterias.js';
import { brl, fmtInt } from '../../assets/js/render.js';

const L = POR_SLUG;
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

export const PRATICOS = [
  {
    slug: 'como-funciona-o-bolao-da-caixa',
    titulo: 'Como funciona o bolão da CAIXA: cotas, recibo e prêmio',
    descricao: 'Entenda o Bolão CAIXA: quem pode montar, como comprar cotas na lotérica ou no app, o que é a tarifa de serviço, como o prêmio é dividido e como fugir de bolão falso.',
    categoria: 'Bolões',
    data: '2026-11-24',
    html: () => `
<p>O bolão é a forma mais popular de jogar em grupo. Várias pessoas dividem o custo de uma aposta com mais números e, se ela ganhar, dividem o prêmio. Desde que a CAIXA criou o <strong>Bolão CAIXA</strong>, isso pode ser feito de forma oficial, com recibo individual para cada participante.</p>

<h2>Como funciona</h2>
<ul class="lista-check">
  <li><strong>Uma lotérica credenciada monta o bolão</strong> e o registra no sistema da CAIXA, escolhendo a loteria, os números (ou Surpresinha), a quantidade de jogos e o número de cotas.</li>
  <li><strong>Cada participante compra uma ou mais cotas.</strong> Na compra, recebe um recibo de cota oficial, com os jogos do bolão e a identificação da cota.</li>
  <li><strong>A CAIXA define as regras:</strong> valores mínimos do bolão e da cota, e números mínimo e máximo de cotas para cada modalidade.</li>
  <li><strong>A lotérica pode cobrar uma tarifa de serviço</strong> além do valor da cota, dentro do limite permitido pela CAIXA (até 35% do valor da cota). Essa tarifa aparece no recibo.</li>
  <li><strong>Se o bolão ganhar,</strong> o prêmio é dividido igualmente entre todas as cotas. Cada participante retira a sua parte com o próprio recibo, sem depender do organizador.</li>
</ul>

<h2>Onde comprar</h2>
<p><strong>Na lotérica:</strong> peça para ver os bolões disponíveis no balcão. Você escolhe o bolão, paga e leva o recibo na hora.</p>
<p><strong>Pela internet:</strong> o portal e o aplicativo Loterias CAIXA vendem cotas de bolões montados pelas lotéricas. Você escolhe a lotérica e o bolão, paga no próprio app e o recibo fica salvo na sua conta.</p>
<p>Em ambos os casos o bolão está registrado na CAIXA. Esse é o ponto que garante o seu prêmio.</p>

<h2>Um exemplo com números</h2>
<p>Imagine um bolão da Mega-Sena com uma aposta de 10 números. Essa aposta cobre ${C(10, 6)} combinações e custa ${brl(C(10, 6) * L['mega-sena'].preco)}. Dividido em 20 cotas, cada cota sai por ${brl((C(10, 6) * L['mega-sena'].preco) / 20)}, mais a tarifa de serviço, se houver.</p>
<p>Com uma cota, você concorre com as ${C(10, 6)} combinações do bolão, e a chance do bolão acertar a Sena é de 1 em ${fmtInt(Math.round(C(60, 6) / C(10, 6)))}, contra 1 em ${fmtInt(C(60, 6))} de uma aposta simples. Em troca, se o bolão ganhar, você recebe 1/20 do prêmio. O bolão não muda a matemática: muda o tamanho do jogo que você consegue fazer com pouco dinheiro. Entenda melhor em <a href="/blog/apostar-mais-numeros-vale-a-pena/">apostar mais números vale a pena?</a>.</p>

<h2>Bolão oficial x "bolão" de WhatsApp</h2>
<p>Muita gente organiza bolões entre amigos ou no trabalho, com uma pessoa recolhendo o dinheiro e fazendo as apostas. Isso não é proibido, mas tem riscos: o prêmio sai no nome de quem tem o bilhete, e a divisão depende da confiança no organizador. Se for fazer assim, combine tudo por escrito, mande foto dos bilhetes para o grupo antes do sorteio e guarde os comprovantes.</p>
<p>Já os "bolões" vendidos por desconhecidos em grupos, perfis e sites, com pagamento por Pix e sem recibo oficial da CAIXA, são o golpe mais comum das loterias. Sem recibo oficial, você não tem como provar que participou nem como receber. Veja outros sinais de alerta em <a href="/blog/golpes-da-loteria-como-se-proteger/">golpes da loteria: como se proteger</a>.</p>

<h2>Dicas para participar</h2>
<ul class="lista-check">
  <li>Confira no recibo a loteria, o concurso, os números e a quantidade de cotas.</li>
  <li>Guarde o recibo (ou o comprovante no app) até conferir o resultado. O prazo para receber é de 90 dias após o sorteio.</li>
  <li>Compare a tarifa de serviço entre lotéricas.</li>
  <li>Bolões de concursos especiais, como a <a href="/blog/mega-da-virada-como-funciona/">Mega da Virada</a>, esgotam rápido. Compre com antecedência.</li>
</ul>
<p>Mais detalhes, e os bolões da lotérica parceira do Pimba, na página <a href="/boloes/">bolões</a>.</p>`,
  },

  {
    slug: 'como-conferir-seu-jogo-da-loteria',
    titulo: 'Como conferir seu jogo da loteria sem erro',
    descricao: 'Passo a passo para conferir apostas da Mega-Sena, Lotofácil, Quina e outras loterias: onde ver o resultado oficial, como usar o conferidor, Teimosinha, Dupla Sena e trevos.',
    categoria: 'Dicas práticas',
    data: '2026-11-24',
    html: () => `
<p>Conferir parece simples, mas todo ano há prêmios que ficam sem dono porque o apostador conferiu errado, olhou o concurso errado ou jogou o bilhete fora. Estes passos evitam isso.</p>

<h2>1. Confira o número do concurso</h2>
<p>Todo bilhete e comprovante mostra o número do concurso em que a aposta vale. Antes de comparar os números, veja se o resultado que você está olhando é desse concurso. Se você jogou com <strong>Teimosinha</strong>, a mesma aposta vale para vários concursos seguidos, e é preciso conferir cada um deles.</p>

<h2>2. Veja o resultado numa fonte confiável</h2>
<p>O resultado oficial é o divulgado pela CAIXA, nos canais oficiais e nas lotéricas. O Pimba mostra os resultados minutos depois de cada sorteio, com a premiação de cada faixa, em <a href="/resultados/">resultados das loterias</a>. Também é possível consultar concursos anteriores, caso você tenha um bilhete antigo.</p>

<h2>3. Compare com calma (ou use o conferidor)</h2>
<p>Marque os números sorteados no bilhete, um por um. Se tiver muitos jogos, o <a href="/conferidor/">conferidor do Pimba</a> faz isso por você: escolha a loteria, marque seus números e veja na hora quantos acertou e quanto pagou cada faixa. Os números que você digita ficam só no seu navegador.</p>
<p>Fique atento às particularidades de cada loteria:</p>
<ul class="lista-check">
  <li><strong>Dupla Sena:</strong> são dois sorteios por concurso. Confira o bilhete nos dois.</li>
  <li><strong>+Milionária:</strong> além dos 6 números, confira os 2 trevos sorteados. Há prêmios com só 2 números e 1 trevo.</li>
  <li><strong>Lotomania:</strong> quem não acerta nenhum dos 20 números também ganha.</li>
  <li><strong>Timemania e Dia de Sorte:</strong> o Time do Coração e o Mês de Sorte dão prêmio sozinhos.</li>
  <li><strong>Super Sete:</strong> o acerto é por coluna, na posição certa.</li>
  <li><strong>Apostas com mais números:</strong> um bilhete com 7 ou mais números pode ganhar em várias faixas ao mesmo tempo. O conferidor calcula isso.</li>
</ul>

<h2>4. Confirme na lotérica ou no app</h2>
<p>Qualquer conferidor, incluindo o do Pimba, é uma ajuda. O que vale é a conferência oficial. Na lotérica, o atendente lê o bilhete no terminal e diz se há prêmio. No app Loterias CAIXA, as apostas feitas pela sua conta mostram o resultado automaticamente.</p>
<p><strong>Nunca jogue o bilhete fora antes da conferência oficial.</strong> Um erro na conferência em casa pode custar um prêmio.</p>

<h2>5. Guarde o bilhete com cuidado</h2>
<ul class="lista-check">
  <li>O bilhete é ao portador: quem estiver com ele pode receber o prêmio. Guarde em lugar seguro.</li>
  <li>Evite dobrar, molhar ou deixar no sol, porque o papel térmico apaga com o tempo e com o calor.</li>
  <li>Assine no verso, se quiser, e tire uma foto. A foto não substitui o bilhete, mas ajuda em caso de dúvida.</li>
</ul>

<h2>6. Ganhou? Fique de olho no prazo</h2>
<p>Você tem 90 dias a partir da data do sorteio para retirar o prêmio. Depois disso o dinheiro vai para o Fundo de Financiamento Estudantil (FIES). Veja onde e como receber em <a href="/blog/como-receber-premio-da-loteria/">como receber o prêmio da loteria</a>.</p>`,
  },

  {
    slug: 'como-receber-premio-da-loteria',
    titulo: 'Como receber o prêmio da loteria: onde, prazo e imposto',
    descricao: 'Ganhou na loteria? Veja onde retirar o prêmio (lotérica ou agência da CAIXA), o prazo de 90 dias, documentos necessários, imposto de renda e prêmios de bolão e do app.',
    categoria: 'Dicas práticas',
    data: '2026-11-24',
    html: () => `
<p>Acertou os números? Antes de comemorar demais, siga alguns passos simples para receber o prêmio com segurança e dentro do prazo.</p>

<h2>O prazo: 90 dias</h2>
<p>O prêmio pode ser retirado em até <strong>90 dias corridos a partir da data do sorteio</strong>. Passado esse prazo, o valor não pago é repassado ao Fundo de Financiamento Estudantil (FIES), como determina a lei. Não deixe para a última semana.</p>

<h2>Onde receber</h2>
<ul class="lista-check">
  <li><strong>Prêmios de valor menor:</strong> podem ser pagos em qualquer lotérica, até o limite definido pela CAIXA. Basta apresentar o bilhete premiado.</li>
  <li><strong>Prêmios acima desse limite:</strong> são pagos nas agências da CAIXA. Leve o bilhete original, um documento de identidade com foto e o CPF. O valor pode ser depositado numa conta ou pago por outro meio combinado com a agência, e prêmios altos podem levar alguns dias para ser liberados.</li>
  <li><strong>Apostas feitas pelo portal ou app Loterias CAIXA:</strong> os prêmios ficam ligados à sua conta. Os de valor menor podem ser transferidos para a sua conta bancária pelo próprio app; os maiores exigem atendimento numa agência.</li>
</ul>
<p>Na dúvida sobre o limite atual ou sobre o procedimento, pergunte na lotérica ou no atendimento oficial da CAIXA.</p>

<h2>Prêmio de bolão</h2>
<p>No Bolão CAIXA, cada participante recebe a sua parte com o próprio <strong>recibo de cota</strong>, sem precisar do organizador. A regra de onde receber (lotérica ou agência) segue o valor da sua cota. Em bolões informais, entre amigos, o prêmio sai para quem tem o bilhete, e a divisão depende do que foi combinado. Por isso o bolão oficial é mais seguro. Veja <a href="/blog/como-funciona-o-bolao-da-caixa/">como funciona o bolão da CAIXA</a>.</p>

<h2>Imposto de renda</h2>
<p>Os prêmios de loteria têm imposto de renda retido na fonte, ou seja, descontado antes do pagamento. Os valores por faixa divulgados pela CAIXA nos resultados já são líquidos, então o que aparece na página do resultado é o que o ganhador recebe. Prêmios pequenos, abaixo do limite de isenção, não têm desconto.</p>
<p>Depois de receber, o prêmio deve ser informado na declaração anual do imposto de renda, como rendimento sujeito à tributação exclusiva. Se o valor for alto, vale conversar com um contador.</p>

<h2>Ganhou muito? Cuidados importantes</h2>
<ul class="lista-check">
  <li><strong>Guarde segredo no começo.</strong> Antes de contar para muita gente, organize-se. Ganhadores de prêmios altos viram alvo de golpes e pedidos.</li>
  <li><strong>Assine o verso do bilhete</strong> e guarde em lugar seguro, porque o bilhete é ao portador.</li>
  <li><strong>Procure uma agência da CAIXA</strong> e peça orientação. Ganhadores de prêmios principais costumam ser atendidos de forma reservada.</li>
  <li><strong>Não tome decisões grandes por impulso.</strong> Deixe o dinheiro aplicado em algo seguro enquanto planeja, de preferência com ajuda profissional.</li>
  <li><strong>Desconfie de contatos inesperados.</strong> A CAIXA não liga, não manda mensagem e não pede taxa para liberar prêmio. Veja <a href="/blog/golpes-da-loteria-como-se-proteger/">golpes da loteria</a>.</li>
</ul>

<h2>Ainda não conferiu?</h2>
<p>Veja o <a href="/resultados/">último resultado de cada loteria</a> e use o <a href="/conferidor/">conferidor</a> para checar seus jogos. O passo a passo completo está em <a href="/blog/como-conferir-seu-jogo-da-loteria/">como conferir seu jogo da loteria</a>.</p>`,
  },

  {
    slug: 'golpes-da-loteria-como-se-proteger',
    titulo: 'Golpes da loteria: os mais comuns e como se proteger',
    descricao: 'Bolão falso no WhatsApp, prêmio que pede taxa, site falso da CAIXA e método milagroso: conheça os golpes mais comuns envolvendo loterias e como não cair neles.',
    categoria: 'Segurança',
    data: '2026-11-24',
    html: () => `
<p>Onde há sonho de prêmio, há golpista. Os golpes com loteria mudam de forma, mas quase sempre seguem os mesmos padrões. Conhecendo-os, fica fácil não cair.</p>

<h2>1. O "bolão" vendido por Pix</h2>
<p>Um perfil, grupo de WhatsApp ou site oferece cotas de bolão, muitas vezes com prêmios acumulados e "vagas limitadas". Você paga por Pix e recebe, no máximo, uma imagem ou planilha. Quando o sorteio sai, ou o bolão "não ganhou", ou o vendedor some.</p>
<p><strong>Como se proteger:</strong> compre cotas apenas com <strong>recibo oficial da CAIXA</strong>, numa lotérica ou no portal e app Loterias CAIXA. Lotéricas sérias que divulgam bolões pelo WhatsApp levam você ao canal oficial ou ao balcão, onde a cota é registrada. Entenda o modelo oficial em <a href="/blog/como-funciona-o-bolao-da-caixa/">como funciona o bolão da CAIXA</a>.</p>

<h2>2. "Você ganhou! Pague a taxa para liberar"</h2>
<p>Chega uma mensagem, ligação ou e-mail dizendo que você ganhou um prêmio da loteria, às vezes de um sorteio em que você nem jogou. Para receber, é preciso pagar uma "taxa de liberação", "imposto" ou "seguro".</p>
<p><strong>Como se proteger:</strong> a CAIXA não entra em contato para avisar ganhadores e nunca cobra para pagar prêmio. O imposto é descontado na fonte. Se você não conferiu e não foi a uma lotérica ou agência, não ganhou nada.</p>

<h2>3. Site ou aplicativo falso</h2>
<p>Páginas que imitam o visual da CAIXA, anúncios com links "para apostar com desconto" e aplicativos de loja que não são oficiais. O objetivo é roubar dados de cartão, senhas ou receber pagamentos de apostas que nunca são registradas.</p>
<p><strong>Como se proteger:</strong> aposte só pelo aplicativo oficial Loterias CAIXA ou pelo portal oficial, digitando o endereço com terminação <strong>caixa.gov.br</strong>. Desconfie de links recebidos por mensagem.</p>

<h2>4. Método, robô ou IA que "acerta os números"</h2>
<p>Cursos, planilhas, robôs de Telegram e "inteligências artificiais" que prometem prever os números ou garantir prêmios. Alguns cobram assinatura, outros vendem "fechamentos milagrosos".</p>
<p><strong>Como se proteger:</strong> o sorteio é aleatório e cada combinação tem a mesma chance. Ninguém consegue prever. Entenda por quê em <a href="/blog/numeros-quentes-e-frios-funcionam/">números quentes e frios funcionam?</a> e em <a href="/blog/probabilidade-na-loteria-como-calcular/">probabilidade na loteria</a>.</p>

<h2>5. Compra de bilhete premiado</h2>
<p>Alguém oferece pagar mais que o valor do prêmio pelo seu bilhete, ou pede para você "receber no seu nome" um prêmio que é dele, em troca de uma comissão. Esse tipo de proposta pode estar ligado a lavagem de dinheiro, e quem empresta o nome pode ter problemas sérios.</p>
<p><strong>Como se proteger:</strong> receba apenas os seus prêmios, nos canais oficiais. Não aceite propostas de terceiros.</p>

<h2>6. Rifas e sorteios sem autorização</h2>
<p>Rifas de carro, moto, celular ou dinheiro, vendidas em redes sociais, geralmente com "sorteio pela Loteria Federal". Sem autorização do governo, esse tipo de sorteio é ilegal, e nada garante que o prêmio exista ou que o sorteio seja honesto.</p>

<h2>Sinais de alerta</h2>
<ul class="lista-check">
  <li>Pressa: "últimas cotas", "só hoje", "responda em 1 hora".</li>
  <li>Pagamento por Pix para pessoa física, sem recibo oficial.</li>
  <li>Promessa de prêmio garantido ou de chance maior.</li>
  <li>Pedido de taxa, senha, código recebido por SMS ou dados do cartão.</li>
  <li>Links encurtados ou endereços que não terminam em caixa.gov.br.</li>
</ul>

<h2>Caí num golpe. E agora?</h2>
<p>Registre um boletim de ocorrência (em muitos estados dá para fazer pela internet), avise o seu banco imediatamente e peça a abertura do <strong>MED (Mecanismo Especial de Devolução)</strong> do Pix, que pode bloquear o valor na conta do golpista. Denuncie o perfil ou número na rede social ou no WhatsApp.</p>
<p>O Pimba é um site de informação. Não vende apostas, não vende cotas e não entra em contato com ganhadores.</p>`,
  },

  {
    slug: 'jogo-responsavel-como-jogar-sem-se-prejudicar',
    titulo: 'Jogo responsável: como jogar na loteria sem se prejudicar',
    descricao: 'Loteria é diversão, não investimento. Veja como definir um limite, os sinais de que o jogo está virando problema e onde buscar ajuda gratuita.',
    categoria: 'Segurança',
    data: '2026-11-24',
    html: () => `
<p>Para a maioria das pessoas, jogar na loteria é uma diversão barata: alguns reais pelo direito de sonhar até o sorteio. Mas, para algumas, o jogo vira um problema que afeta o dinheiro, o trabalho e a família. Jogar com responsabilidade é manter a loteria no lugar de diversão.</p>

<h2>Comece pela matemática</h2>
<p>Na loteria, a maior parte do dinheiro arrecadado não volta para os apostadores: vai para repasses sociais previstos em lei (seguridade social, esporte, cultura, segurança pública, educação), para custos e para as lotéricas. Isso quer dizer que, no longo prazo, quem joga sempre recebe de volta menos do que apostou. A chance de ganhar a Mega-Sena com uma aposta simples é de 1 em ${fmtInt(L['mega-sena'].odds[0][1])}.</p>
<p>Por isso, <strong>loteria não é investimento nem fonte de renda</strong>. O dinheiro gasto em apostas deve ser tratado como gasto com lazer, como um ingresso de cinema.</p>

<h2>Regras simples para jogar bem</h2>
<ul class="lista-check">
  <li><strong>Defina um valor por mês</strong> que não faça falta, e não passe dele. Se acabar, espere o próximo mês.</li>
  <li><strong>Nunca jogue com dinheiro de contas</strong>, de dívidas, emprestado ou do cartão de crédito parcelado.</li>
  <li><strong>Não tente "recuperar"</strong> o que gastou apostando mais. Cada sorteio é independente, e o prejuízo tende a crescer.</li>
  <li><strong>Prêmio pequeno não é sinal de sorte.</strong> Se ganhar R$ 20, não é motivo para jogar R$ 100.</li>
  <li><strong>Desconfie de promessas.</strong> Não existe método garantido. Veja <a href="/blog/golpes-da-loteria-como-se-proteger/">golpes da loteria</a>.</li>
  <li><strong>Apostas são proibidas para menores de 18 anos.</strong> Não peça para um adolescente fazer a sua aposta.</li>
</ul>

<h2>Sinais de alerta</h2>
<p>Preste atenção se você, ou alguém próximo:</p>
<ul class="lista-check">
  <li>Gasta cada vez mais para ter a mesma emoção.</li>
  <li>Esconde da família quanto joga, ou mente sobre isso.</li>
  <li>Deixa de pagar contas ou pega dinheiro emprestado para apostar.</li>
  <li>Fica irritado ou ansioso quando não consegue jogar.</li>
  <li>Pensa em apostas o tempo todo ou joga para fugir de problemas.</li>
  <li>Já tentou parar ou diminuir e não conseguiu.</li>
</ul>
<p>Se você se reconheceu em algum desses pontos, não é motivo de vergonha. O jogo compulsivo é reconhecido como um transtorno de saúde e tem tratamento.</p>

<h2>Onde buscar ajuda</h2>
<ul class="lista-check">
  <li><strong>SUS:</strong> os Centros de Atenção Psicossocial (CAPS) atendem pessoas com dependência, inclusive de jogos, de graça. Procure a unidade básica de saúde do seu bairro para ser encaminhado.</li>
  <li><strong>Jogadores Anônimos:</strong> grupos de apoio gratuitos, presenciais e on-line, para quem quer parar de jogar.</li>
  <li><strong>CVV (Centro de Valorização da Vida):</strong> apoio emocional gratuito, 24 horas, pelo telefone 188 ou pelo chat no site do CVV.</li>
  <li><strong>Família e amigos:</strong> contar para alguém de confiança e pedir ajuda para controlar o dinheiro é um passo importante.</li>
</ul>

<h2>Ferramentas que ajudam</h2>
<ul class="lista-check">
  <li>Anote quanto gasta com apostas por mês, mesmo que sejam valores pequenos.</li>
  <li>Se joga pelo aplicativo, evite deixar cartão salvo e saldo parado.</li>
  <li>Prefira jogar em bolão com amigos ou família: o custo é menor e o jogo vira um momento social.</li>
</ul>
<p>No Pimba, todas as ferramentas, do <a href="/gerador/">gerador</a> às <a href="/estatisticas/">estatísticas</a>, trazem o mesmo aviso: nada aumenta a sua chance de ganhar. A gente acredita que informação honesta é a melhor forma de jogar por diversão. Leia também a nossa página de <a href="/jogo-responsavel/">jogo responsável</a>.</p>`,
  },
];
