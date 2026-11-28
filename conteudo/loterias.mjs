// Pimba v1.7.0 — texto próprio de cada loteria, mostrado na página de resultado (/resultados/<loteria>/).
// Escrito pela Equipe Pimba para que cada página tenha conteúdo original, e não só os números da CAIXA.
// Preço, chances e dias vêm de assets/js/loterias.js. Aqui ficam história, o que a loteria tem de diferente,
// concursos especiais e perguntas frequentes próprias de cada uma. Revisado em 28/11/2026.

export const REVISADO = '2026-11-28';

export const TEXTO_LOTERIA = {
  'mega-sena': {
    artigo: 'como-jogar-na-mega-sena',
    sobre: [
      'A Mega-Sena começou em março de 1996 e virou a loteria mais conhecida do Brasil. É a que paga os maiores prêmios regulares do país, justamente porque é uma das mais difíceis: são 50.063.860 combinações possíveis de seis números entre 1 e 60.',
      'Quando ninguém acerta as seis dezenas, o prêmio principal acumula para o concurso seguinte. Por isso a estimativa cresce em saltos e chama tanta gente para as lotéricas quando passa de dezenas de milhões. As faixas da quina e da quadra são pagas em todo concurso, divididas entre quem acertou.',
      'Na prática, a maior parte das pessoas joga a aposta simples de seis números. Cada número a mais no volante multiplica as combinações (e o preço), como mostra a tabela abaixo. É por isso que bolões costumam usar apostas de 7 a 10 números: o custo fica dividido entre as cotas.',
    ],
    especial: 'A Mega da Virada, sorteada em 31 de dezembro, é o concurso especial da Mega-Sena. Ela tem uma regra própria: o prêmio não acumula. Se ninguém acertar as seis dezenas, o valor vai para quem acertou cinco.',
    faq: [
      ['Quantos números posso marcar na Mega-Sena?', 'De 6 a 20 números no mesmo volante. Com 6 você faz uma aposta simples; com mais números o preço sobe porque a aposta passa a valer por várias combinações de seis.'],
      ['O que acontece se ninguém ganhar a Mega-Sena?', 'O prêmio da sena acumula e é somado ao do próximo concurso. A exceção é a Mega da Virada, que não acumula: sem ganhador da sena, o prêmio vai para os acertadores da quina.'],
      ['Qual a chance de ganhar na Mega-Sena com uma aposta simples?', 'Uma em 50.063.860 para a sena, uma em 154.518 para a quina e uma em 2.332 para a quadra.'],
    ],
  },
  lotofacil: {
    artigo: 'como-jogar-na-lotofacil',
    sobre: [
      'A Lotofácil existe desde setembro de 2003 e é a loteria com mais apostadores frequentes, porque combina sorteios quase todos os dias com a maior chance de prêmio entre as loterias da CAIXA. São 25 números no volante e 15 sorteados, então acertar 11 é comum: acontece, em média, uma vez a cada 11 apostas simples.',
      'Os prêmios de 11, 12 e 13 acertos têm valor fixo, definido pela CAIXA. Já os de 14 e 15 acertos dependem do quanto foi arrecadado e de quantas apostas acertaram, e por isso mudam de um concurso para outro. Com tantos sorteios na semana, é comum o prêmio principal sair para várias apostas ao mesmo tempo.',
      'Como 15 dos 25 números saem em todo sorteio, os resultados da Lotofácil parecem muito "cheios": é normal haver sequências longas e muitos números repetidos do concurso anterior. A análise de cada concurso, nesta página, mostra o quanto isso é esperado pela matemática.',
    ],
    especial: 'A Lotofácil da Independência é o concurso especial de setembro, com prêmio bem maior que o normal. Como os outros especiais, ela não acumula: se ninguém fizer 15 pontos, o prêmio vai para quem fez 14.',
    faq: [
      ['Quantos números são sorteados na Lotofácil?', 'São sorteados 15 números entre 1 e 25. Você marca de 15 a 20 números e ganha com 11, 12, 13, 14 ou 15 acertos.'],
      ['Por que é tão fácil acertar 11 na Lotofácil?', 'Porque 15 dos 25 números saem em todo sorteio. Com 15 números marcados, a chance de acertar exatamente 11 é de uma em 11, e a de acertar 11 ou mais é de cerca de uma em 9.'],
      ['Os prêmios da Lotofácil são fixos?', 'Os de 11, 12 e 13 acertos, sim. Os de 14 e 15 acertos são divididos entre os ganhadores e variam a cada concurso.'],
    ],
  },
  quina: {
    artigo: 'como-jogar-na-quina',
    sobre: [
      'A Quina é uma das loterias mais antigas em funcionamento no país: o primeiro sorteio foi em março de 1994. O volante tem 80 números e são sorteados 5. Você ganha a partir de 2 acertos (o duque), o que faz da Quina uma das loterias com mais faixas pequenas pagas.',
      'O prêmio principal é bem menor que o da Mega-Sena na maioria das semanas, mas os sorteios acontecem de segunda a sábado pela grade antiga e, desde julho de 2026, de segunda a sexta e no domingo de manhã. Muitos sorteios por semana significam acúmulos mais curtos e prêmios que saem com mais frequência.',
      'Uma característica da Quina é o tamanho do volante: com 80 números e só 5 sorteados, os resultados costumam ficar bem espalhados e é raro ver números seguidos. Na análise do concurso, mostramos a chance real de isso acontecer.',
    ],
    especial: 'A Quina de São João é o concurso especial de junho. O prêmio não acumula: se ninguém acertar as cinco dezenas, ele vai para quem acertou quatro.',
    faq: [
      ['Com quantos acertos se ganha na Quina?', 'Com 2, 3, 4 ou 5 acertos. As faixas se chamam duque, terno, quadra e quina.'],
      ['Quantos números posso marcar na Quina?', 'De 5 a 15 números entre 1 e 80. Quanto mais números, mais combinações e maior o preço da aposta.'],
      ['Qual a chance de ganhar o prêmio principal da Quina?', 'Uma em 24.040.016 com a aposta simples de 5 números.'],
    ],
  },
  lotomania: {
    artigo: null,
    sobre: [
      'A Lotomania foi lançada em 1999 e tem um jeito de jogar diferente de todas as outras: você marca 50 dos 100 números do volante (de 00 a 99), e a CAIXA sorteia 20. Como a quantidade de números é sempre a mesma, a aposta tem preço único.',
      'A Lotomania é a única loteria da CAIXA em que errar tudo também dá prêmio: quem não acerta nenhum dos 20 números sorteados ganha uma faixa própria. Pela matemática, fazer 0 pontos é exatamente tão difícil quanto fazer 20, porque as duas coisas exigem que os 20 números sorteados caiam todos do mesmo lado da sua aposta.',
      'Existe também a aposta espelho: com ela, o sistema joga para você os outros 50 números que você não marcou, como uma segunda aposta paga à parte. Juntas, as duas apostas cobrem o volante inteiro.',
    ],
    especial: null,
    faq: [
      ['Como funciona a Lotomania?', 'Você marca 50 números entre 00 e 99 e a CAIXA sorteia 20. Ganha quem acertar 15, 16, 17, 18, 19 ou 20 números, ou nenhum.'],
      ['Quem não acerta nenhum número ganha na Lotomania?', 'Sim. Acertar 0 números é uma faixa de prêmio, com a mesma chance de acertar os 20: uma em 11.372.636.'],
      ['O que é a aposta espelho da Lotomania?', 'É uma segunda aposta, paga à parte, com os 50 números que você deixou em branco no volante.'],
    ],
  },
  timemania: {
    artigo: null,
    sobre: [
      'A Timemania começou em 2008 e foi criada com um objetivo além do prêmio: parte da arrecadação vai para os clubes de futebol que aderiram ao programa, para ajudar a pagar dívidas com o governo federal. Por isso o volante tem, além dos números, uma lista de 80 times.',
      'Você marca 10 números entre 1 e 80 e escolhe um Time do Coração. São sorteados 7 números e 1 time. Ganha quem acertar de 3 a 7 números, e há uma faixa separada para quem acertou o time sorteado, independente dos números.',
      'Como a aposta tem sempre 10 números, não há como aumentar as combinações no mesmo volante: o preço é único. A faixa do Time do Coração é a mais fácil de toda a Timemania, com chance de uma em 80.',
    ],
    especial: null,
    faq: [
      ['Como se joga na Timemania?', 'Marque 10 números entre 1 e 80 e escolha um Time do Coração. São sorteados 7 números e um time.'],
      ['Acertar só o time dá prêmio na Timemania?', 'Sim. O Time do Coração é uma faixa própria, com chance de uma em 80 por aposta.'],
      ['Para onde vai o dinheiro da Timemania?', 'Parte vai para os prêmios e parte para os repasses previstos em lei, incluindo os clubes de futebol que aderiram ao programa da Timemania.'],
    ],
  },
  'dupla-sena': {
    artigo: null,
    sobre: [
      'A Dupla Sena foi lançada em 2001 e o nome explica a ideia: cada concurso tem dois sorteios. Com uma única aposta, você concorre nos dois, e pode ganhar em um, no outro ou nos dois ao mesmo tempo.',
      'O volante tem 50 números. Você marca de 6 a 15 e, em cada sorteio, saem 6. Há prêmio para 3, 4, 5 e 6 acertos em cada um dos sorteios, o que dá à Dupla Sena oito faixas de premiação por concurso.',
      'Ter dois sorteios não dobra a chance do prêmio principal de um sorteio, mas praticamente dobra a chance de ganhar alguma coisa no concurso. O prêmio da sena do primeiro sorteio costuma ser maior que o do segundo.',
    ],
    especial: 'A Dupla de Páscoa é o concurso especial da Dupla Sena, sorteado na época da Páscoa, na data definida pela CAIXA. O prêmio principal não acumula.',
    faq: [
      ['Como funciona a Dupla Sena?', 'Cada concurso tem dois sorteios de 6 números entre 1 e 50. A mesma aposta concorre nos dois.'],
      ['Quantos acertos precisa para ganhar na Dupla Sena?', 'De 3 a 6 acertos em qualquer um dos dois sorteios.'],
      ['Posso ganhar nos dois sorteios da Dupla Sena?', 'Sim. Os prêmios dos dois sorteios são independentes, e uma aposta pode ser premiada nos dois.'],
    ],
  },
  'dia-de-sorte': {
    artigo: null,
    sobre: [
      'O Dia de Sorte foi lançado em 2018 e usa os números de um calendário: são 31 números, como os dias de um mês, e você marca de 7 a 15 deles. Além dos números, escolhe um Mês de Sorte.',
      'Com só 31 números no volante, o Dia de Sorte tem a melhor chance de prêmio principal entre as loterias da CAIXA: uma em 2.629.575 com a aposta de 7 números. O Mês de Sorte é uma faixa à parte, com chance de uma em 12.',
      'Muita gente joga datas de aniversário e casamento no Dia de Sorte, e o volante favorece isso. Não muda a chance de ganhar, mas pode aumentar a chance de dividir o prêmio, porque as datas mais populares são as mesmas para muita gente.',
    ],
    especial: null,
    faq: [
      ['Como funciona o Dia de Sorte?', 'Você marca de 7 a 15 números entre 1 e 31 e escolhe um mês. São sorteados 7 números e um Mês de Sorte.'],
      ['Qual a loteria com maior chance de ganhar o prêmio principal?', 'Entre as loterias de números da CAIXA, o Dia de Sorte: uma em 2.629.575 com a aposta mínima.'],
      ['Acertar só o mês dá prêmio no Dia de Sorte?', 'Sim. O Mês de Sorte é uma faixa própria, com chance de uma em 12.'],
    ],
  },
  'super-sete': {
    artigo: null,
    sobre: [
      'O Super Sete foi lançado em 2020 e funciona de um jeito diferente das loterias de dezenas. O volante tem 7 colunas, cada uma com os números de 0 a 9. Você escolhe um número por coluna, e a CAIXA sorteia um número para cada coluna.',
      'Cada coluna é um sorteio separado, então o mesmo número pode sair em várias colunas no mesmo concurso. Ganha quem acerta de 3 a 7 colunas. Acertar as 7 tem chance de uma em 10 milhões, porque são 10 possibilidades em cada uma das 7 colunas.',
      'Por ser recente e menos conhecido, o Super Sete costuma acumular por vários concursos seguidos. A análise do concurso, nesta página, mostra quantos números se repetiram entre colunas e quantas colunas coincidiram com o concurso anterior.',
    ],
    especial: null,
    faq: [
      ['Como se joga no Super Sete?', 'Escolha um número de 0 a 9 em cada uma das 7 colunas. A CAIXA sorteia um número por coluna.'],
      ['Com quantos acertos se ganha no Super Sete?', 'Com 3, 4, 5, 6 ou 7 colunas certas.'],
      ['O mesmo número pode sair em duas colunas do Super Sete?', 'Sim. Cada coluna tem seu próprio sorteio, então números repetidos entre colunas são comuns.'],
    ],
  },
  'mais-milionaria': {
    artigo: 'como-funciona-a-mais-milionaria',
    sobre: [
      'A +Milionária é a loteria mais nova da CAIXA: o primeiro sorteio foi em maio de 2022. Ela foi criada para ter o prêmio principal mais difícil e mais alto, com garantia de no mínimo R$ 10 milhões na faixa principal.',
      'O volante tem duas partes. Você marca de 6 a 12 números entre 1 e 50 e de 2 a 6 trevos entre 1 e 6. São sorteados 6 números e 2 trevos. O prêmio principal exige acertar os 6 números e os 2 trevos, com chance de uma em 238.360.500 na aposta mínima.',
      'Em compensação, a +Milionária tem 10 faixas de premiação, a maior quantidade entre as loterias da CAIXA. Dá para ganhar com só 2 números certos, desde que você acerte também um ou os dois trevos.',
    ],
    especial: null,
    faq: [
      ['Como funciona a +Milionária?', 'Marque de 6 a 12 números entre 1 e 50 e de 2 a 6 trevos entre 1 e 6. São sorteados 6 números e 2 trevos.'],
      ['Qual o prêmio mínimo da +Milionária?', 'A faixa principal tem prêmio mínimo garantido de R$ 10 milhões.'],
      ['Quantas faixas de prêmio tem a +Milionária?', 'Dez, de 6 números e 2 trevos até 2 números e 1 trevo.'],
    ],
  },
  federal: {
    artigo: null,
    sobre: [
      'A Loteria Federal é a mais antiga das loterias da CAIXA em funcionamento, com extrações desde 1962. Ela não tem volante: você compra um bilhete já numerado, inteiro ou em frações, com um número de 5 algarismos entre 00000 e 99999.',
      'Em cada extração são sorteados 5 bilhetes premiados, do 1º ao 5º prêmio. Além deles, há prêmios menores por aproximação (números vizinhos do 1º prêmio), pela dezena e pela centena finais e pelo final do bilhete. Por isso muita gente confere só os últimos algarismos.',
      'Quem compra uma fração recebe a parte proporcional do prêmio. O preço do bilhete e o valor dos prêmios mudam conforme a extração: as especiais, como a de Natal, pagam mais.',
    ],
    especial: 'A Federal tem extrações especiais ao longo do ano, com prêmio maior e bilhete mais caro. A mais conhecida é a de Natal.',
    faq: [
      ['Como se joga na Loteria Federal?', 'Você compra um bilhete numerado (inteiro ou fração) numa lotérica ou nos canais da CAIXA. Não há números para escolher no volante.'],
      ['Quantos prêmios tem a Loteria Federal?', 'Cinco prêmios principais por extração, além de prêmios por aproximação, dezena e centena finais e final do bilhete.'],
      ['Qual a chance de ganhar o 1º prêmio da Federal?', 'Uma em 100.000 por número de bilhete.'],
    ],
  },
  loteca: {
    artigo: null,
    sobre: [
      'A Loteca é a loteria de futebol da CAIXA e herdeira da antiga Loteria Esportiva, criada em 1970. Em vez de números, você dá palpites no resultado de 14 jogos da rodada: vitória do mandante, empate ou vitória do visitante.',
      'Ganha quem acerta 13 ou 14 jogos. Dá para marcar palpites duplos ou triplos em alguns jogos (cobrindo dois ou os três resultados), o que aumenta as combinações e o preço da aposta.',
      'Diferente das outras loterias, na Loteca conhecimento de futebol pesa, mas os resultados surpreendentes, as zebras, são o que faz o prêmio acumular. A análise de cada concurso mostra quantas vitórias de mandante, empates e vitórias de visitante a rodada teve.',
    ],
    especial: null,
    faq: [
      ['Como funciona a Loteca?', 'Você palpita no resultado de 14 jogos de futebol: vitória do time da casa, empate ou vitória do visitante.'],
      ['Com quantos acertos se ganha na Loteca?', 'Com 13 ou 14 acertos.'],
      ['O que é palpite duplo e triplo na Loteca?', 'É marcar dois ou os três resultados possíveis num mesmo jogo. A aposta fica mais cara, porque passa a valer por mais combinações.'],
    ],
  },
};
