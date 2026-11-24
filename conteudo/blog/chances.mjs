// Pimba v1.6.0 — artigos do blog: probabilidade, mais números, quentes e frios.
import { POR_SLUG } from '../../assets/js/loterias.js';
import { brl, fmtInt } from '../../assets/js/render.js';

const L = POR_SLUG;
const odds = (slug, i = 0) => fmtInt(L[slug].odds[i][1]);
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };

export const CHANCES = [
  {
    slug: 'probabilidade-na-loteria-como-calcular',
    titulo: 'Probabilidade na loteria: como calcular a chance de ganhar',
    descricao: 'Aprenda a calcular a chance de ganhar na Mega-Sena, Lotofácil e outras loterias com uma conta simples de combinações. Com exemplos passo a passo e comparações do dia a dia.',
    categoria: 'Chances e matemática',
    data: '2026-11-24',
    html: () => `
<p>Toda loteria divulga a chance de ganhar em cada faixa, mas quase ninguém sabe de onde saem esses números. A boa notícia é que a conta é simples e ajuda a entender por que nenhum "método" funciona.</p>

<h2>A ideia central: contar combinações</h2>
<p>Num sorteio honesto, todas as combinações possíveis têm a mesma chance de sair. Então a chance de ganhar o prêmio principal com um jogo é:</p>
<p class="destaque-formula"><strong>1 dividido pelo número de combinações possíveis</strong></p>
<p>O trabalho todo é contar quantas combinações existem. Para isso usamos a fórmula de <strong>combinação</strong>, que diz de quantas maneiras dá para escolher k itens dentre n, sem importar a ordem:</p>
<p class="destaque-formula">C(n, k) = n! ÷ (k! × (n − k)!)</p>
<p>O ponto de exclamação é o fatorial: 5! = 5 × 4 × 3 × 2 × 1 = 120. Na prática, a conta fica mais fácil assim: multiplique os k maiores números a partir de n e divida pelo fatorial de k.</p>

<h2>Exemplo: Mega-Sena</h2>
<p>Na Mega-Sena são sorteados 6 números entre 60. Quantas combinações de 6 existem?</p>
<p class="destaque-formula">C(60, 6) = (60 × 59 × 58 × 57 × 56 × 55) ÷ (6 × 5 × 4 × 3 × 2 × 1) = ${fmtInt(C(60, 6))}</p>
<p>Por isso a chance da Sena com uma aposta simples é de 1 em ${odds('mega-sena')}. Não é uma estimativa, é uma contagem exata.</p>

<h2>E as faixas menores?</h2>
<p>Para a Quadra (4 acertos), contamos de quantas formas um jogo pode ter exatamente 4 dos 6 números sorteados e 2 dos 54 que não saíram:</p>
<ul class="lista-check">
  <li>Escolher 4 dos 6 sorteados: C(6, 4) = 15 formas.</li>
  <li>Escolher 2 dos 54 não sorteados: C(54, 2) = 1.431 formas.</li>
  <li>Total de jogos com exatamente 4 acertos: 15 × 1.431 = 21.465.</li>
</ul>
<p>A chance é 21.465 em ${fmtInt(C(60, 6))}, ou cerca de 1 em ${odds('mega-sena', 2)}. É exatamente o número que a CAIXA divulga.</p>

<h2>Exemplo: Lotofácil</h2>
<p>Na Lotofácil são sorteados 15 números entre 25. C(25, 15) = ${fmtInt(C(25, 15))}. Essa é a chance de acertar os 15 com uma aposta simples: 1 em ${odds('lotofacil')}. Bem menor que a da Mega-Sena porque existem muito menos combinações.</p>

<h2>Exemplo: +Milionária</h2>
<p>Quando há duas partes no volante, multiplicam-se as combinações de cada uma. Na +Milionária são 6 números entre 50 e 2 trevos entre 6:</p>
<p class="destaque-formula">C(50, 6) × C(6, 2) = ${fmtInt(C(50, 6))} × 15 = ${odds('mais-milionaria')}</p>

<h2>Para ter noção do tamanho desses números</h2>
<ul class="lista-check">
  <li>1 em ${odds('mega-sena')} é como acertar, de primeira, um único grão marcado num saco com cerca de 50 milhões de grãos de arroz, algo perto de uma tonelada.</li>
  <li>Quem fizesse uma aposta simples em todos os sorteios da Mega-Sena por 50 anos (3 por semana, cerca de 7.800 jogos) teria aproximadamente 0,016% de chance de ganhar a Sena alguma vez.</li>
  <li>A chance de acertar a Sena é menor que a de tirar "cara" 25 vezes seguidas numa moeda (1 em 33,5 milhões).</li>
</ul>

<h2>O que essa conta ensina</h2>
<p>Primeiro: a única coisa que muda a sua chance é <strong>quantas combinações você joga</strong>. Marcar 7 números na Mega-Sena cobre 7 combinações de 6, e a chance fica 7 vezes maior, pelo preço de 7 apostas. Detalhamos isso em <a href="/blog/apostar-mais-numeros-vale-a-pena/">apostar mais números vale a pena?</a>.</p>
<p>Segundo: escolher números "de um jeito especial" não muda nada, porque cada combinação continua sendo uma entre milhões, todas com a mesma chance. É por isso que <a href="/blog/numeros-quentes-e-frios-funcionam/">números quentes e frios não funcionam</a>.</p>
<p>A tabela com as chances de todas as faixas de todas as loterias está na página <a href="/probabilidades/">chances de ganhar</a>.</p>`,
  },

  {
    slug: 'apostar-mais-numeros-vale-a-pena',
    titulo: 'Apostar mais números vale a pena? Quanto custa e quanto ajuda',
    descricao: 'Marcar 7, 8 ou 10 números na Mega-Sena ou 16 e 17 na Lotofácil aumenta a chance na mesma proporção do preço. Veja as tabelas, as contas e a alternativa do bolão.',
    categoria: 'Chances e matemática',
    data: '2026-11-24',
    html: () => `
<p>Uma das dúvidas mais comuns é se vale a pena marcar mais números no volante. A resposta curta: aumenta a chance, mas o preço sobe exatamente na mesma proporção. Não existe atalho, e entender a conta ajuda a decidir.</p>

<h2>Por que o preço sobe tanto</h2>
<p>Quando você marca 7 números na Mega-Sena, o sistema considera todas as combinações de 6 que dá para formar com esses 7. São 7 combinações. Por isso a aposta custa o mesmo que 7 apostas simples. Com 8 números já são 28 combinações; com 10, são 210. O crescimento é rápido porque o número de combinações cresce muito mais depressa do que a quantidade de números marcados.</p>

<h2>Mega-Sena</h2>
<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Números</th><th>Combinações</th><th>Preço</th><th>Chance da Sena</th></tr></thead><tbody>
${[6, 7, 8, 9, 10, 12, 15].map((k) => { const c = C(k, 6); return `<tr><td>${k}</td><td>${fmtInt(c)}</td><td>${brl(c * L['mega-sena'].preco)}</td><td>1 em ${fmtInt(Math.round(C(60, 6) / c))}</td></tr>`; }).join('\n')}
</tbody></table></div>

<h2>Lotofácil</h2>
<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Números</th><th>Combinações</th><th>Preço</th><th>Chance de 15 acertos</th></tr></thead><tbody>
${[15, 16, 17, 18, 19, 20].map((k) => { const c = C(k, 15); return `<tr><td>${k}</td><td>${fmtInt(c)}</td><td>${brl(c * L.lotofacil.preco)}</td><td>1 em ${fmtInt(Math.round(C(25, 15) / c))}</td></tr>`; }).join('\n')}
</tbody></table></div>
<p class="muted small">Preços com a aposta mínima vigente: Mega-Sena ${brl(L['mega-sena'].preco)} e Lotofácil ${brl(L.lotofacil.preco)}. Confira a tabela atual no app Loterias CAIXA.</p>

<h2>Então não faz diferença?</h2>
<p>Do ponto de vista da matemática, fazer uma aposta de 7 números ou 7 apostas simples diferentes dá praticamente no mesmo: em ambos os casos você cobre 7 combinações. A diferença é que, numa aposta com mais números, as combinações se sobrepõem. Se você acertar, costuma ganhar também em faixas menores. Por exemplo, quem acerta a Sena com 7 números marcados também leva 6 Quinas, porque várias das combinações cobertas têm 5 dos números sorteados.</p>
<p>Ou seja: mais números não são um "truque", são simplesmente mais apostas no mesmo bilhete.</p>

<h2>O jeito barato de jogar com mais números: bolão</h2>
<p>Se você quer participar de um jogo com 9 ou 10 números na Mega-Sena sem pagar tudo sozinho, o bolão resolve. Por exemplo, uma aposta de 10 números custa ${brl(C(10, 6) * L['mega-sena'].preco)}. Dividida em 20 cotas, cada pessoa paga ${brl((C(10, 6) * L['mega-sena'].preco) / 20)} (mais a tarifa de serviço da lotérica, se houver). Em troca, se o bolão ganhar, o prêmio também é dividido em 20.</p>
<p>A chance de cada participante ganhar <em>alguma coisa</em> é a do bolão inteiro, mas o valor que cada um leva é uma fração. Na média, o retorno por real apostado é o mesmo de jogar sozinho. A vantagem é poder sonhar com um jogo maior gastando pouco. Veja os detalhes em <a href="/blog/como-funciona-o-bolao-da-caixa/">como funciona o bolão da CAIXA</a>.</p>

<h2>Cuidado com "fechamentos" e "desdobramentos"</h2>
<p>Na internet há quem venda planilhas de "fechamento" que prometem garantir prêmios. O que elas fazem é escolher um conjunto de apostas que cobre certas combinações: <em>se</em> os números sorteados estiverem dentro do grupo que você escolheu, você garante uma faixa menor. Mas para isso os números sorteados precisam estar no seu grupo, o que continua sendo questão de sorte. E você paga por todas as apostas da planilha. Nenhum fechamento muda a probabilidade por real apostado.</p>

<h2>Resumo</h2>
<ul class="lista-check">
  <li>Cada número a mais multiplica as combinações, a chance e o preço na mesma proporção.</li>
  <li>Não há vantagem matemática escondida em apostas com mais números, só a conveniência de ter tudo num bilhete.</li>
  <li>Bolões permitem jogar com mais números pagando uma fração, e o prêmio também é dividido.</li>
  <li>Defina antes quanto vai gastar no mês. Veja mais em <a href="/blog/jogo-responsavel-como-jogar-sem-se-prejudicar/">jogo responsável</a>.</li>
</ul>`,
  },

  {
    slug: 'numeros-quentes-e-frios-funcionam',
    titulo: 'Números quentes e frios funcionam? O que a estatística diz',
    descricao: 'Números que mais saem, números atrasados e a falácia do apostador: entenda por que estatística de sorteios passados não aumenta a chance de ganhar na loteria.',
    categoria: 'Chances e matemática',
    data: '2026-11-24',
    html: () => `
<p>Muita gente escolhe os números da loteria olhando as estatísticas: os "quentes", que mais saíram nos últimos concursos, ou os "frios" e "atrasados", que estão há muito tempo sem aparecer. O Pimba mostra essas estatísticas e tem até um gerador com esses modos. Mas a pergunta honesta é: isso aumenta a chance? A resposta é não, e vale entender por quê.</p>

<h2>As bolas não têm memória</h2>
<p>Nos sorteios da CAIXA, as bolas são sorteadas de forma aleatória, com equipamentos auditados e transmissão ao vivo. A cada concurso o sorteio recomeça do zero: o globo não sabe quais números saíram na semana passada. Então, em cada sorteio, todos os números têm exatamente a mesma chance de sair.</p>
<p>Na Mega-Sena, por exemplo, cada número tem 6 chances em 60 (10%) de estar entre os sorteados de um concurso, seja ele o mais sorteado da história ou o que está há 50 concursos sem sair.</p>

<h2>Por que alguns números saem mais que outros?</h2>
<p>Porque é assim que o acaso se comporta em amostras pequenas. Se você jogar uma moeda 20 vezes, é bem provável que saia algo como 13 caras e 7 coroas, e não exatamente 10 e 10. Isso não quer dizer que a moeda prefere cara. Com mais lançamentos, a proporção tende a se aproximar de 50%, mas diferenças sempre existem.</p>
<p>Com os números da loteria é igual. Nos últimos 50 ou 100 concursos alguns números aparecem mais e outros menos. Se a mesma conta for feita em outro período, os "quentes" e "frios" mudam. É isso que você vê nas <a href="/estatisticas/">estatísticas das loterias</a>: uma fotografia do passado, não uma previsão.</p>

<h2>A falácia do apostador</h2>
<p>A ideia de que um número atrasado "está para sair" tem nome: falácia do apostador. É a mesma sensação de quem, depois de cinco "caras" seguidas, acha que agora vem "coroa". A chance continua 50%. O caso mais famoso aconteceu num cassino de Monte Carlo em 1913, quando a roleta deu preto 26 vezes seguidas e muitos apostadores perderam fortunas apostando no vermelho, achando que ele "tinha que" sair.</p>
<p>O raciocínio inverso, de que um número quente "está com sorte" e vai continuar saindo, também é falso pelo mesmo motivo.</p>

<h2>Então para que servem as estatísticas?</h2>
<ul class="lista-check">
  <li><strong>Curiosidade:</strong> é divertido acompanhar quais números estão aparecendo.</li>
  <li><strong>Um jeito de escolher:</strong> se você não tem números preferidos, usar os quentes, os frios ou um <a href="/gerador/">gerador aleatório</a> é tão bom quanto qualquer outro método. Nenhum é melhor.</li>
  <li><strong>Conferir se o sorteio é honesto:</strong> em muitos concursos, a frequência de todos os números tende a ficar parecida. As diferenças que aparecem são do tamanho que o acaso explica.</li>
</ul>

<h2>O que realmente muda alguma coisa</h2>
<p>Só duas coisas mudam o seu resultado na loteria:</p>
<ul class="lista-check">
  <li><strong>Quantas combinações você joga.</strong> Mais combinações, mais chance, e mais custo na mesma proporção. Veja <a href="/blog/apostar-mais-numeros-vale-a-pena/">apostar mais números vale a pena?</a>.</li>
  <li><strong>Com quantas pessoas você divide o prêmio, se ganhar.</strong> Combinações muito populares, como sequências e datas, são escolhidas por milhares de pessoas. Evitá-las não aumenta a chance de ganhar, mas reduz a chance de dividir.</li>
</ul>

<h2>Desconfie de quem vende previsão</h2>
<p>Sites, vídeos e aplicativos que prometem "os números que vão sair", "inteligência artificial que acerta a Mega" ou "método garantido" estão vendendo algo que não existe. Se alguém soubesse prever o sorteio, não precisaria vender o método. Veja outros sinais de alerta em <a href="/blog/golpes-da-loteria-como-se-proteger/">golpes da loteria: como se proteger</a>.</p>
<p>Quer ver a matemática por trás disso? Leia <a href="/blog/probabilidade-na-loteria-como-calcular/">probabilidade na loteria: como calcular</a>.</p>`,
  },
];
