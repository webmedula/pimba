// Pimba v1.6.0 — artigos do blog: como jogar cada modalidade.
// Preços e chances vêm de assets/js/loterias.js (fonte única), para o texto nunca ficar desatualizado.
import { LOTERIAS, POR_SLUG } from '../../assets/js/loterias.js';
import { brl, fmtInt } from '../../assets/js/render.js';

const L = POR_SLUG;
const odds = (slug, i = 0) => fmtInt(L[slug].odds[i][1]);
const tabelaOdds = (slug) => `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Faixa</th><th>Chance com a aposta mínima</th></tr></thead><tbody>${L[slug].odds
  .map(([f, o]) => `<tr><td>${f}</td><td>1 em ${fmtInt(o)}</td></tr>`).join('')}</tbody></table></div>`;

// Tabela "quantos números marcar": combinações, preço e chance do prêmio principal.
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
const tabelaMarcar = (slug, qtds) => {
  const l = L[slug];
  const total = C(l.max - l.min + 1, l.sorteia);
  return `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Números marcados</th><th>Equivale a</th><th>Preço</th><th>Chance do prêmio principal</th></tr></thead><tbody>${qtds
    .map((k) => { const jogos = C(k, l.escolhe); return `<tr><td>${k}</td><td>${fmtInt(jogos)} ${jogos === 1 ? 'jogo' : 'jogos'}</td><td>${brl(jogos * l.preco)}</td><td>1 em ${fmtInt(Math.round(total / jogos))}</td></tr>`; })
    .join('')}</tbody></table></div><p class="muted small">Preços calculados com a aposta mínima vigente (${brl(l.preco)}). Confira a tabela atual no app Loterias CAIXA.</p>`;
};

export const MODALIDADES = [
  {
    slug: 'guia-das-loterias-da-caixa',
    titulo: 'Guia das loterias da CAIXA: como funciona cada uma',
    descricao: 'Mega-Sena, Lotofácil, Quina, +Milionária, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, Federal e Loteca: regras, preço, dias de sorteio e chances de cada loteria.',
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A CAIXA tem hoje onze modalidades de loteria. Todas são vendidas nas lotéricas e no portal e aplicativo Loterias CAIXA, mas cada uma tem um jeito de jogar, um preço e uma chance de ganhar bem diferentes. Este guia reúne o essencial de cada uma para você escolher sabendo o que está fazendo.</p>

<h2>As loterias de números</h2>
<p>Na maioria das modalidades você marca números num volante e torce para que eles sejam sorteados. O que muda é quantos números existem, quantos você escolhe e quantos são sorteados. Quanto mais números possíveis e menos números sorteados, mais difícil é acertar tudo, e maior costuma ser o prêmio.</p>
<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Loteria</th><th>Como jogar</th><th>Aposta mínima</th><th>Chance do prêmio principal</th></tr></thead><tbody>
${LOTERIAS.filter((l) => l.tipo === 'dezenas' || l.tipo === 'colunas').map((l) => `<tr><td><a href="/resultados/${l.slug}/">${l.nome}</a></td><td>${l.tipo === 'colunas' ? '1 número de 0 a 9 em cada uma das 7 colunas' : `${l.escolhe}${l.escolheMax > l.escolhe ? ` a ${l.escolheMax}` : ''} números de ${l.min} a ${l.max}`}</td><td>${brl(l.preco)}</td><td>1 em ${fmtInt(l.odds[0][1])}</td></tr>`).join('\n')}
</tbody></table></div>
<p>Alguns destaques:</p>
<ul class="lista-check">
  <li><strong>Mega-Sena:</strong> a mais famosa e a de prêmios mais altos. Também é uma das mais difíceis. Veja o <a href="/blog/como-jogar-na-mega-sena/">guia completo da Mega-Sena</a>.</li>
  <li><strong>Lotofácil:</strong> como o nome diz, é a mais fácil de acertar alguma coisa. Tem sorteio quase todo dia. Veja <a href="/blog/como-jogar-na-lotofacil/">como jogar na Lotofácil</a>.</li>
  <li><strong>Quina:</strong> sorteios de segunda a sexta e aos domingos, com prêmio a partir de 2 acertos. Veja <a href="/blog/como-jogar-na-quina/">como jogar na Quina</a>.</li>
  <li><strong>+Milionária:</strong> a mais nova e a mais difícil, com números e trevos. Veja <a href="/blog/como-funciona-a-mais-milionaria/">como funciona a +Milionária</a>.</li>
  <li><strong>Lotomania:</strong> você marca 50 números de 00 a 99 e são sorteados 20. Curiosidade: quem não acerta nenhum número também ganha.</li>
  <li><strong>Timemania:</strong> além dos números, você escolhe um Time do Coração. Acertar só o time já dá um prêmio pequeno. Parte da arrecadação vai para clubes de futebol.</li>
  <li><strong>Dupla Sena:</strong> cada concurso tem dois sorteios, e o mesmo bilhete concorre nos dois.</li>
  <li><strong>Dia de Sorte:</strong> números de 1 a 31, como os dias do mês, mais um Mês de Sorte. Tem a melhor chance de prêmio principal entre as loterias de números.</li>
  <li><strong>Super Sete:</strong> funciona por colunas. Em cada uma das 7 colunas você escolhe um número de 0 a 9.</li>
</ul>

<h2>Loteria Federal</h2>
<p>A Federal é a mais antiga e funciona de outro jeito: em vez de escolher números, você compra um bilhete já numerado, inteiro ou em frações. São sorteados cinco bilhetes premiados e há prêmios menores para quem tem números próximos ou o mesmo final. A chance do 1º prêmio é de 1 em ${odds('federal')} por bilhete. O preço varia de extração para extração.</p>

<h2>Loteca</h2>
<p>A Loteca é a loteria do futebol. O volante traz 14 jogos da semana e você marca coluna 1 (vitória do mandante), coluna do meio (empate) ou coluna 2 (vitória do visitante). Ganha quem acerta 13 ou 14 resultados. Aqui conhecimento de futebol ajuda um pouco, mas zebras são frequentes.</p>

<h2>Quando são os sorteios</h2>
<p>Desde julho de 2026, os sorteios regulares acontecem de segunda a sexta às 21h (a Federal às 20h) e aos domingos às 11h, no horário de Brasília. Não há mais sorteios regulares aos sábados. Cada loteria tem seus dias: a Lotofácil, a Quina e o Dia de Sorte sorteiam quase todo dia, enquanto a Mega-Sena sorteia três vezes por semana. Veja tudo no <a href="/calendario/">calendário de sorteios</a>.</p>

<h2>Qual escolher?</h2>
<p>Não existe loteria "melhor", existe a que combina com o que você quer. Se a ideia é sonhar com um prêmio que muda de vida, a Mega-Sena e a +Milionária pagam mais, mas as chances são minúsculas. Se você prefere ganhar alguma coisa de vez em quando, a Lotofácil paga a partir de 11 acertos, o que acontece em média uma vez a cada ${odds('lotofacil', 4)} jogos. A comparação completa está na página <a href="/probabilidades/">qual loteria é mais fácil de ganhar</a>.</p>
<p>Em qualquer caso, encare a loteria como diversão paga. Defina um valor que não faça falta e não passe dele. Falamos mais sobre isso no texto sobre <a href="/blog/jogo-responsavel-como-jogar-sem-se-prejudicar/">jogo responsável</a>.</p>`,
  },

  {
    slug: 'como-jogar-na-mega-sena',
    titulo: 'Como jogar na Mega-Sena: regras, preço, prêmios e chances',
    descricao: `Tudo sobre a Mega-Sena: como marcar o volante, quanto custa (${brl(L['mega-sena'].preco)} a aposta simples), dias de sorteio, como o prêmio é dividido e a chance real de ganhar.`,
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A Mega-Sena é a loteria mais popular do Brasil e a que costuma pagar os maiores prêmios. Também é uma das mais difíceis de ganhar. Entender as regras ajuda a jogar com expectativa realista e a gastar só o que planejou.</p>

<h2>Como jogar</h2>
<p>O volante tem 60 números, de 1 a 60. Na aposta simples você marca 6 números. Pode marcar mais, até 20, e o preço sobe porque cada número a mais equivale a várias apostas de 6. Se não quiser escolher, peça a <strong>Surpresinha</strong>, e o sistema escolhe números aleatórios para você. Com a <strong>Teimosinha</strong>, o mesmo jogo concorre em vários concursos seguidos.</p>
<p>Você pode jogar em qualquer lotérica ou pelo portal e aplicativo Loterias CAIXA, para maiores de 18 anos. A aposta simples custa ${brl(L['mega-sena'].preco)}.</p>

<h2>Quando são os sorteios</h2>
<p>A Mega-Sena é sorteada ${L['mega-sena'].dias}, no horário de Brasília. Os sorteios são transmitidos ao vivo pelos canais oficiais da CAIXA e o resultado aparece no Pimba minutos depois, na página de <a href="/resultados/mega-sena/">resultado da Mega-Sena</a>. As datas de cada semana estão no <a href="/calendario/mega-sena/">calendário da Mega-Sena</a>.</p>

<h2>O que dá prêmio</h2>
<p>São sorteados 6 números. Ganha quem acertar:</p>
<ul class="lista-check">
  <li><strong>6 números (Sena):</strong> o prêmio principal.</li>
  <li><strong>5 números (Quina):</strong> prêmio intermediário.</li>
  <li><strong>4 números (Quadra):</strong> o prêmio menor.</li>
</ul>
<p>O valor de cada faixa não é fixo. Uma parte do que foi arrecadado no concurso vai para os prêmios e é dividida entre os ganhadores de cada faixa. Por isso, uma quadra pode pagar mais num concurso e menos no outro, dependendo de quanto se apostou e de quantas pessoas acertaram.</p>
<p>Se ninguém acerta os 6 números, o prêmio principal <strong>acumula</strong> para o concurso seguinte. É assim que surgem os prêmios de centenas de milhões. Uma parte da arrecadação de cada concurso também é reservada para a <a href="/blog/mega-da-virada-como-funciona/">Mega da Virada</a>, sorteada em 31 de dezembro.</p>

<h2>Quais são as chances</h2>
<p>Com uma aposta simples de 6 números, as chances são estas:</p>
${tabelaOdds('mega-sena')}
<p>Para ter uma ideia do tamanho de 1 em ${odds('mega-sena')}: quem fizesse uma aposta simples em todos os três sorteios da semana, durante 50 anos seguidos, teria cerca de 0,016% de chance de ganhar a Sena alguma vez. É muito mais provável não ganhar nunca.</p>

<h2>Vale a pena marcar mais números?</h2>
<p>Marcar mais números aumenta a chance na mesma proporção em que aumenta o preço. Uma aposta de 7 números equivale a 7 apostas de 6, e custa 7 vezes mais. Não há desconto nem vantagem escondida:</p>
${tabelaMarcar('mega-sena', [6, 7, 8, 9, 10, 15])}
<p>Se você quer jogar com mais números sem pagar tudo sozinho, a saída é o bolão: várias pessoas dividem uma aposta grande e o prêmio. Explicamos tudo em <a href="/blog/como-funciona-o-bolao-da-caixa/">como funciona o bolão da CAIXA</a> e em <a href="/blog/apostar-mais-numeros-vale-a-pena/">apostar mais números vale a pena?</a>.</p>

<h2>Dicas que ajudam de verdade</h2>
<ul class="lista-check">
  <li><strong>Fuja das combinações populares.</strong> Sequências como 1-2-3-4-5-6, datas de aniversário (números até 31) e padrões no volante são muito escolhidos. Isso não muda a chance de ganhar, mas se você ganhar com eles, a chance de dividir o prêmio com muita gente é maior.</li>
  <li><strong>Guarde o bilhete ou o comprovante.</strong> É ele que garante o prêmio. Confira com calma no <a href="/conferidor/?l=mega-sena">conferidor</a> e veja <a href="/blog/como-conferir-seu-jogo-da-loteria/">como conferir o seu jogo</a>.</li>
  <li><strong>Desconfie de métodos.</strong> Nenhum sistema, planilha ou inteligência artificial prevê o sorteio. Entenda por que em <a href="/blog/numeros-quentes-e-frios-funcionam/">números quentes e frios funcionam?</a>.</li>
</ul>

<h2>Ganhei. E agora?</h2>
<p>Você tem 90 dias a partir da data do sorteio para retirar o prêmio. Prêmios pequenos podem ser recebidos numa lotérica; os maiores, numa agência da CAIXA. O passo a passo está em <a href="/blog/como-receber-premio-da-loteria/">como receber o prêmio da loteria</a>.</p>`,
  },

  {
    slug: 'como-jogar-na-lotofacil',
    titulo: 'Como jogar na Lotofácil: regras, preço e chances de ganhar',
    descricao: `Guia da Lotofácil: marque de 15 a 20 números entre 1 e 25, aposta de ${brl(L.lotofacil.preco)}, sorteios quase todo dia e prêmio a partir de 11 acertos. Veja as chances reais.`,
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A Lotofácil é a loteria em que é mais comum ganhar alguma coisa. Com apenas 25 números no volante e 15 sorteados, acertar 11 números acontece com frequência. O prêmio principal é menor que o da Mega-Sena, mas a chance de ganhá-lo é muito maior.</p>

<h2>Como jogar</h2>
<p>O volante tem 25 números, de 1 a 25. Você marca no mínimo 15 e no máximo 20. A aposta de 15 números custa ${brl(L.lotofacil.preco)}. Como na Mega-Sena, dá para pedir a Surpresinha (números aleatórios) e a Teimosinha (o mesmo jogo em vários concursos seguidos). Joga-se nas lotéricas e no portal e aplicativo Loterias CAIXA.</p>

<h2>Quando são os sorteios</h2>
<p>A Lotofácil é sorteada ${L.lotofacil.dias}, no horário de Brasília. Ou seja, praticamente todo dia, menos sábado. O resultado aparece em <a href="/resultados/lotofacil/">resultado da Lotofácil</a> e as datas em <a href="/calendario/lotofacil/">calendário da Lotofácil</a>.</p>

<h2>O que dá prêmio</h2>
<p>São sorteados 15 números. Há cinco faixas de prêmio: 11, 12, 13, 14 e 15 acertos. As faixas de 11, 12 e 13 acertos pagam valores fixos definidos pela CAIXA. As faixas de 14 e 15 acertos dividem o que sobra da parte da arrecadação destinada a prêmios, e o prêmio de 15 acertos acumula se ninguém acertar.</p>

<h2>Quais são as chances</h2>
${tabelaOdds('lotofacil')}
<p>Em média, 1 em cada ${odds('lotofacil', 4)} apostas simples acerta 11 números. Isso não quer dizer que, jogando ${odds('lotofacil', 4)} vezes, você com certeza vai ganhar: é uma média de longo prazo, e o acaso pode tanto antecipar quanto atrasar esse prêmio.</p>

<h2>Marcar mais números</h2>
<p>Na Lotofácil o preço cresce rápido a cada número extra, porque são muitas combinações de 15 dentro de 16, 17 ou mais números:</p>
${tabelaMarcar('lotofacil', [15, 16, 17, 18, 19, 20])}
<p>Repare que a chance melhora exatamente na mesma proporção do preço. Para jogar com 17 ou 18 números sem gastar centenas de reais, muita gente participa de <a href="/blog/como-funciona-o-bolao-da-caixa/">bolões</a>.</p>

<h2>Lotofácil da Independência</h2>
<p>Todo ano, perto de 7 de setembro, a CAIXA faz a Lotofácil da Independência, um concurso especial com prêmio bem maior. Como na Mega da Virada, o prêmio principal desse concurso não acumula: se ninguém acertar os 15, ele é dividido entre quem acertou 14.</p>

<h2>Cuidados</h2>
<p>Como se ganha com frequência na Lotofácil, é fácil cair na armadilha de "reinvestir" prêmios pequenos e jogar cada vez mais. Lembre que, na média, o jogador recebe de volta menos do que aposta: a maior parte da arrecadação vai para repasses sociais e custos, não para prêmios. Confira seus jogos no <a href="/conferidor/?l=lotofacil">conferidor da Lotofácil</a> e jogue com limite. Veja também <a href="/blog/jogo-responsavel-como-jogar-sem-se-prejudicar/">jogo responsável</a>.</p>`,
  },

  {
    slug: 'como-jogar-na-quina',
    titulo: 'Como jogar na Quina: regras, preço, prêmios e chances',
    descricao: `Guia da Quina: marque de 5 a 15 números entre 1 e 80, aposta de ${brl(L.quina.preco)}, prêmio a partir de 2 acertos e sorteios quase todo dia. Veja as chances reais.`,
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A Quina é uma das loterias mais antigas da CAIXA. Fica no meio do caminho: o prêmio principal é grande, a chance é menor que a da Lotofácil, mas há uma faixa de prêmio para quem acerta só 2 números.</p>

<h2>Como jogar</h2>
<p>O volante tem 80 números, de 1 a 80. Você marca de 5 a 15 números. A aposta simples, de 5 números, custa ${brl(L.quina.preco)}. Também há Surpresinha e Teimosinha. Aposta-se nas lotéricas e no portal e aplicativo Loterias CAIXA.</p>

<h2>Quando são os sorteios</h2>
<p>A Quina é sorteada ${L.quina.dias}, no horário de Brasília. Acompanhe em <a href="/resultados/quina/">resultado da Quina</a> e veja as próximas datas no <a href="/calendario/quina/">calendário da Quina</a>.</p>

<h2>O que dá prêmio</h2>
<p>São sorteados 5 números, e há quatro faixas:</p>
<ul class="lista-check">
  <li><strong>5 acertos (Quina):</strong> prêmio principal, que acumula se ninguém acertar.</li>
  <li><strong>4 acertos (Quadra)</strong>, <strong>3 acertos (Terno)</strong> e <strong>2 acertos (Duque)</strong>: prêmios menores, divididos entre os ganhadores de cada faixa.</li>
</ul>

<h2>Quais são as chances</h2>
${tabelaOdds('quina')}
<p>O Duque, com 2 acertos, sai em média para 1 em cada ${odds('quina', 3)} apostas simples. Já acertar os 5 números é cerca de duas vezes mais fácil que a Sena da Mega-Sena: a chance na Quina é 1 em ${odds('quina')}, contra 1 em ${odds('mega-sena')} na Mega-Sena. Ainda assim, é um número enorme.</p>

<h2>Marcar mais números</h2>
${tabelaMarcar('quina', [5, 6, 7, 10, 15])}

<h2>Quina ou Mega-Sena?</h2>
<p>As duas são parecidas no jeito de jogar, mas têm perfis diferentes. A Quina tem mais números no volante (80 contra 60), porém sorteia só 5. O resultado é que acertar tudo na Quina é cerca de duas vezes mais fácil que na Mega-Sena, e a aposta mínima é mais barata (${brl(L.quina.preco)} contra ${brl(L['mega-sena'].preco)}). Em compensação, os prêmios principais da Mega-Sena costumam ser bem maiores, porque ela arrecada mais e acumula com frequência.</p>
<p>Outra diferença está nas faixas menores. Na Quina, acertar 2 números já dá prêmio; na Mega-Sena, só a partir de 4. Por isso quem joga na Quina ganha prêmios pequenos com mais frequência. Se você gosta de jogar quase todo dia, a Quina tem sorteio de segunda a sexta e aos domingos; a Mega-Sena, três vezes por semana.</p>

<h2>Quina de São João</h2>
<p>Em junho, a CAIXA faz a Quina de São João, um concurso especial com prêmio reforçado. Assim como nos outros concursos especiais, o prêmio principal não acumula: se ninguém acertar os 5 números, ele vai para quem acertou 4.</p>

<h2>Dicas</h2>
<ul class="lista-check">
  <li>Use o <a href="/conferidor/?l=quina">conferidor da Quina</a> para checar todos os seus jogos de uma vez.</li>
  <li>Quer variar os números? O <a href="/gerador/?l=quina">gerador de números</a> sorteia jogos aleatórios, e as <a href="/estatisticas/quina/">estatísticas da Quina</a> mostram o que saiu nos últimos concursos. Só lembre que nada disso muda a chance: cada sorteio é independente.</li>
  <li>Se o prêmio estiver acumulado, mais gente joga. Isso não altera a sua chance, mas aumenta a probabilidade de dividir o prêmio.</li>
</ul>`,
  },

  {
    slug: 'como-funciona-a-mais-milionaria',
    titulo: '+Milionária: como funciona, trevos, preço e chances',
    descricao: `Entenda a +Milionária: 6 números de 1 a 50 mais 2 trevos de 1 a 6, aposta de ${brl(L['mais-milionaria'].preco)} e dez faixas de prêmio. Veja por que é a loteria mais difícil da CAIXA.`,
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A +Milionária é a loteria mais nova da CAIXA, lançada em 2022. Ela foi criada para ter prêmios principais altos, e o preço disso é a chance mais baixa de todas as loterias brasileiras. Em compensação, tem dez faixas de prêmio, inclusive para quem acerta só 2 números.</p>

<h2>Como jogar</h2>
<p>O volante tem duas partes:</p>
<ul class="lista-check">
  <li><strong>Números:</strong> você marca de 6 a 12 números entre 1 e 50.</li>
  <li><strong>Trevos:</strong> você marca de 2 a 6 trevos entre 1 e 6.</li>
</ul>
<p>A aposta mínima (6 números e 2 trevos) custa ${brl(L['mais-milionaria'].preco)}. Marcar mais números ou mais trevos aumenta a quantidade de combinações e o preço.</p>

<h2>Quando são os sorteios</h2>
<p>A +Milionária é sorteada ${L['mais-milionaria'].dias}, no horário de Brasília. São sorteados 6 números e 2 trevos. Veja o <a href="/resultados/mais-milionaria/">resultado da +Milionária</a> e o <a href="/calendario/mais-milionaria/">calendário de sorteios</a>.</p>

<h2>As dez faixas de prêmio</h2>
<p>O prêmio principal exige acertar os 6 números e os 2 trevos. As outras faixas combinam acertos de números e de trevos:</p>
${tabelaOdds('mais-milionaria')}

<h2>Por que é tão difícil</h2>
<p>A conta é simples. Existem ${fmtInt(15890700)} maneiras de escolher 6 números entre 50, e 15 maneiras de escolher 2 trevos entre 6. Multiplicando, são ${odds('mais-milionaria')} combinações possíveis, e só uma leva o prêmio principal. É quase cinco vezes mais difícil que a Sena da Mega-Sena (1 em ${odds('mega-sena')}).</p>
<p>Se quiser entender como se faz esse tipo de cálculo para qualquer loteria, veja <a href="/blog/probabilidade-na-loteria-como-calcular/">probabilidade na loteria: como calcular</a>.</p>

<h2>Marcar mais números ou mais trevos</h2>
<p>Na +Milionária dá para aumentar a aposta de dois jeitos: marcando mais números (até 12) ou mais trevos (até 6). Em ambos os casos o sistema considera todas as combinações de 6 números e 2 trevos que cabem no seu volante. Marcar 7 números e 2 trevos equivale a 7 apostas; marcar 6 números e 3 trevos equivale a 3 apostas, porque existem 3 pares possíveis entre 3 trevos. O preço sobe na mesma proporção, e a chance também. Não existe combinação "mais eficiente": cada real compra a mesma fração de chance.</p>

<h2>Como o prêmio é dividido</h2>
<p>Como nas outras loterias, uma parte da arrecadação de cada concurso vai para os prêmios, distribuída entre as faixas. Se ninguém acerta a faixa principal, o valor acumula para o concurso seguinte. Como a chance é muito baixa, é comum a +Milionária passar várias semanas acumulando, o que faz o prêmio crescer bastante. Isso não muda a chance de cada aposta, mas atrai mais apostadores, e com eles a probabilidade de o prêmio ser dividido.</p>

<h2>Vale a pena?</h2>
<p>Depende do que você procura. Se o objetivo é concorrer a um prêmio muito alto com uma aposta só, a +Milionária oferece isso. Se prefere ganhar alguma coisa com mais frequência, a <a href="/blog/como-jogar-na-lotofacil/">Lotofácil</a> faz mais sentido. Em qualquer caso, o melhor é decidir quanto gastar antes de jogar.</p>
<p>Na hora de conferir, o <a href="/conferidor/?l=mais-milionaria">conferidor da +Milionária</a> já considera os trevos e mostra em que faixa você ficou.</p>`,
  },

  {
    slug: 'mega-da-virada-como-funciona',
    titulo: 'Mega da Virada: como funciona, quando é e quanto custa',
    descricao: 'Como funciona a Mega da Virada: sorteio em 31 de dezembro, prêmio que não acumula, quando as apostas abrem, preço, bolões e as chances reais de ganhar.',
    categoria: 'Como jogar',
    data: '2026-11-24',
    html: () => `
<p>A Mega da Virada é o concurso especial da Mega-Sena sorteado em 31 de dezembro. É o maior prêmio do ano nas loterias brasileiras e o concurso em que mais gente joga, inclusive quem nunca aposta no resto do ano.</p>

<h2>Como funciona</h2>
<p>As regras do jogo são as mesmas da <a href="/blog/como-jogar-na-mega-sena/">Mega-Sena</a>: você marca de 6 a 20 números entre 1 e 60, e são sorteados 6. A aposta simples tem o mesmo preço da Mega-Sena comum, ${brl(L['mega-sena'].preco)}. O que muda é o tamanho do prêmio e uma regra importante:</p>
<ul class="lista-check">
  <li><strong>O prêmio não acumula.</strong> Se ninguém acertar os 6 números, o prêmio principal é dividido entre quem acertou 5. Se ninguém acertar 5, vai para quem acertou 4.</li>
  <li><strong>O prêmio é formado ao longo do ano.</strong> Uma parte da arrecadação de cada concurso da Mega-Sena é guardada para a Virada, por isso o valor costuma passar das centenas de milhões.</li>
</ul>

<h2>Quando é o sorteio e quando dá para apostar</h2>
<p>O sorteio é em 31 de dezembro, à noite. As apostas específicas para a Mega da Virada costumam abrir algumas semanas antes, e o volante e o aplicativo indicam claramente que o jogo é para o concurso especial. Confira a data de abertura e o horário de encerramento das apostas no app Loterias CAIXA ou numa lotérica, porque eles mudam a cada ano. Nos últimos dias a procura é enorme e as filas também, então vale apostar com antecedência.</p>

<h2>Qual a chance de ganhar</h2>
<p>A chance é exatamente a mesma de um concurso comum da Mega-Sena: 1 em ${odds('mega-sena')} com uma aposta simples. O prêmio maior não deixa o sorteio mais fácil. Na verdade, como muito mais gente joga, a chance de ter que <strong>dividir</strong> o prêmio é maior. Em várias edições o prêmio principal saiu para mais de uma aposta.</p>
${tabelaMarcar('mega-sena', [6, 7, 8, 9, 10])}

<h2>Bolões da Virada</h2>
<p>Por causa do prêmio alto, os bolões ficam muito populares no fim do ano. Num bolão, um grupo divide o custo de uma aposta com mais números e, se ganhar, divide o prêmio. O jeito seguro é comprar a cota numa lotérica ou no app Loterias CAIXA, com recibo oficial. Fuja de "bolões" vendidos por Pix em grupos de WhatsApp sem recibo da CAIXA: veja <a href="/blog/como-funciona-o-bolao-da-caixa/">como funciona o bolão oficial</a> e <a href="/blog/golpes-da-loteria-como-se-proteger/">os golpes mais comuns</a>.</p>

<h2>Antes de jogar</h2>
<ul class="lista-check">
  <li>Defina quanto vai gastar e não passe disso, mesmo com o clima de festa. Veja <a href="/blog/jogo-responsavel-como-jogar-sem-se-prejudicar/">jogo responsável</a>.</li>
  <li>Guarde o bilhete ou o comprovante do app até conferir. O prazo para receber é de 90 dias após o sorteio.</li>
  <li>No dia 31, o resultado aparece no Pimba minutos após o sorteio, em <a href="/resultados/mega-sena/">resultado da Mega-Sena</a>, e você pode checar todos os seus jogos no <a href="/conferidor/?l=mega-sena">conferidor</a>.</li>
</ul>`,
  },
];
