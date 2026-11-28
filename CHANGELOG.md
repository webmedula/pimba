# Changelog — Pimba

## v1.7.0 — 2026-11-28
Revisão do AdSense: em 26/11/2026 o Google reprovou o site por "anúncios em telas com conteúdo replicado" e "conteúdo de baixo valor". Esta versão ataca as duas causas.
- **Causa principal (conteúdo replicado):** cada concurso antigo tinha a própria página indexável (`/resultados/<loteria>/<concurso>/`), ligada pelos botões "← Concurso anterior". São dezenas de milhares de páginas iguais à do resultado oficial da CAIXA, só com outros números, e todas carregavam o script do AdSense. Agora essas páginas continuam funcionando para quem quer conferir um concurso antigo, mas saem do Google (`noindex,follow`) e não carregam anúncio
- **Análise de cada concurso**, escrita pelo Pimba a partir do resultado (`assets/js/analise.js`): pares e ímpares, metade de baixo e de cima do volante, soma comparada com a média, sequências de números seguidos, números repetidos do concurso anterior, o número mais atrasado, e quanto o concurso pagou (vezes a aposta mínima, total de apostas premiadas, em quantos estados saiu). Cada padrão vem com a chance matemática de acontecer. Super Sete tem análise por coluna, Loteca por resultado dos jogos, Dupla Sena compara os dois sorteios. Já vem no HTML servido pelo Worker
- **Texto próprio de cada loteria** na página de resultado (`conteudo/loterias.mjs`): história, o que ela tem de diferente, concurso especial, 3 perguntas frequentes próprias (com dados estruturados `FAQPage`) e link para o guia do blog. Nenhum parágrafo se repete entre loterias (teste garante)
- **Quanto custa jogar com mais números:** tabela calculada por combinatória em cada loteria em que dá para marcar mais números (Mega-Sena, Lotofácil, Quina, Dupla Sena, Dia de Sorte, +Milionária), com preço e chance do prêmio principal
- **Anúncio só onde há conteúdo:** o script do AdSense agora fica só na home, nas páginas de resultado de cada loteria, nas estatísticas de cada loteria, em Chances e nos artigos do blog. Saiu de conferidor, gerador, bolões, calendário, índices (resultados, estatísticas, blog), Sobre, Contato, Privacidade, Termos, Jogo responsável e páginas `noindex`
- **Home e /resultados/ já chegam com os resultados no HTML** (antes vinham com "Carregando…" e dependiam do JavaScript). Se a CAIXA demorar mais de 3 s, a página sai como antes e o navegador completa. O `/` passou a rodar no Worker (`run_worker_first`)
- Sobre e Privacidade explicam onde os anúncios aparecem
- 8 testes novos (82 no total)

## v1.6.4 — 2026-11-26
Correção: a Super Sete continuava sem resultado na v1.6.3, embora o site da CAIXA já mostrasse o concurso 926.
- **Causa:** o Pimba consultava o servidor `servicebus2.caixa.gov.br`, que devolve erro 500 em toda consulta da Super Sete (último concurso e concursos antigos). O próprio site das Loterias CAIXA usa outro servidor, o `servicebus3.caixa.gov.br` (está no arquivo `/Style Library/json/params.txt` deles), e ali a Super Sete responde normalmente
- **Worker:** busca primeiro no `servicebus3`. Se ele falhar, a nova tentativa vai para o `servicebus2`. Continua no máximo 2 pedidos por loteria, dentro do limite do plano grátis. Vale para o último concurso e para concursos antigos
- `CAIXA_API_BASE` (dados falsos em desenvolvimento) continua valendo sozinho
- 5 testes novos (74 no total)

## v1.6.3 — 2026-11-26
Correção: na página inicial só a Super Sete ficava com "Resultado indisponível agora", mesmo depois de "Tentar de novo".
- **Causa:** a API da CAIXA parou de responder só para a Super Sete (o endereço `/supersete` e até concursos antigos, como `/supersete/700`, dão erro), enquanto Mega-Sena, Quina e as outras respondem normalmente. O site não tinha outra cópia guardada da Super Sete naquele servidor, então o card ficava vazio. O "Tentar de novo" ainda mandava para a página da Super Sete, que depende da mesma API e falhava igual
- **Worker:** todo pedido à CAIXA agora desiste em 8 segundos, para uma loteria travada não segurar a fila das outras. A última cópia boa de cada loteria fica guardada 30 dias (eram 7). Se a CAIXA falhar e não houver cópia, o site usa o concurso mais novo do histórico das estatísticas (números, concurso e data), marcado como não confirmado
- **Cards e página do resultado:** quando o resultado vem de cópia guardada, aparece o aviso "A CAIXA não está respondendo agora: este é o último resultado que conseguimos buscar e pode já haver um concurso mais novo". Sem premiação guardada, a página diz isso e manda para o site oficial
- **Sem nenhum dado:** o card diz "A CAIXA não está respondendo para a Super Sete agora", com "Tentar de novo" e link para o site da CAIXA. O "Tentar de novo" que falha fica na home ("Ainda sem resposta. Tentar de novo") em vez de abrir uma página que também falharia
- Assim que a CAIXA voltar a responder para a Super Sete, o card volta sozinho, sem nova versão
- 6 testes novos (69 no total)

## v1.6.2 — 2026-11-25
Correção: o conferidor travava logo depois da atualização v1.6.1. A grade de números não aparecia, o contador ficava vazio e o botão "Conferir" não fazia nada.
- **Causa:** a página carrega o `conferidor.js` com a versão no endereço (`?v=1.6.1`), mas ele importa o `render.js`, o `loterias.js` e o `conferir.js` sem versão. Quem tinha aberto o site na última hora ainda tinha o `render.js` antigo guardado no navegador (cache de 1 hora). O `conferidor.js` novo pedia uma função que só existe no `render.js` novo (`extraDe`, do conserto do "Time:" vazio) e o navegador desistia do script inteiro. O Worker e a CAIXA não tinham culpa: a falha era antes de qualquer consulta
- **Conserto:** o build agora põe `?v=<versão>` em todos os imports entre os scripts do site (`scripts/versionar.mjs`). A cada versão nova, o navegador baixa o conjunto inteiro e nunca mistura arquivo novo com antigo. Vale também para gerador, estatísticas, calendário, resultados e home, que tinham o mesmo risco
- Quem estava com o conferidor travado volta a ver a grade assim que esta versão subir, sem limpar nada
- 2 testes novos (63 no total)

## v1.6.1 — 2026-11-25
Correção: na página inicial alguns cards ficavam com "Resultado indisponível agora" (ou com o resultado anterior), enquanto a página de cada loteria já mostrava o concurso novo. E um "Time:" vazio aparecia em loterias que não têm time.
- **Causa:** a home pedia as 11 loterias à CAIXA de uma vez só. A CAIXA costuma recusar rajadas assim, e cada loteria que falhava virava "indisponível". A resposta incompleta ainda ficava 2 minutos guardada no navegador. A página de cada loteria faz um pedido só, por isso funcionava
- **Worker:** no máximo 4 pedidos simultâneos à CAIXA, com 1 nova tentativa quando um falha. O último concurso de cada loteria fica guardado por 7 dias com a hora em que foi salvo: até 5 minutos sai direto do cache; depois disso busca na CAIXA e, se ela falhar, entrega a última cópia boa (marcada `desatualizado`) em vez de "indisponível". Nunca volta para um concurso anterior
- Resposta incompleta ou com cópia antiga não fica guardada no navegador (`no-store`); a completa fica só 60 s (era 120 s)
- **Home:** cada loteria que veio faltando (ou desatualizada) é buscada sozinha em `/api/resultado/<loteria>`, o mesmo endereço da página da loteria, com 2 tentativas. "Tentar de novo" busca ali mesmo, sem sair da página. Quem volta para a aba depois de 5 minutos vê os resultados atualizados sem recarregar
- **"Time:" vazio:** a CAIXA manda o campo do Time do Coração/Mês de Sorte em todas as loterias, preenchido com caracteres invisíveis nas que não usam. Agora esses caracteres são removidos e o campo só aparece na Timemania e no Dia de Sorte (cards, página de resultado e conferidor), inclusive para dados que já estavam no cache
- 6 testes novos (61 no total), incluindo o Worker rodando com a CAIXA fora do ar

## v1.6.0 — 2026-11-24
Site mais completo para a revisão do AdSense: blog com conteúdo próprio, página de contato e páginas institucionais reforçadas.
- **Blog** (`/blog/`) com 14 artigos originais: guia das 11 loterias, como jogar na Mega-Sena, Lotofácil, Quina e +Milionária, Mega da Virada, como calcular a probabilidade, apostar mais números vale a pena?, números quentes e frios funcionam?, como funciona o bolão da CAIXA, como conferir o jogo, como receber o prêmio, golpes da loteria e jogo responsável
- Preços, chances e dias de sorteio nos artigos vêm de `assets/js/loterias.js`: quando a CAIXA reajustar, o texto atualiza junto. Nenhum artigo promete ganho (teste garante) e todos terminam com o aviso de jogo responsável
- Cada artigo tem autor (Equipe Pimba), data, tempo de leitura, dados estruturados `BlogPosting`, links internos para resultados, conferidor, calendário e outros artigos, e "Leia também". Seção "Aprenda antes de jogar" na home e link "Blog" no menu e no rodapé
- **Página de contato** (`/contato/`) com o e-mail `contato@pimba.com.br` (configurável em `src/config.js`). O e-mail também aparece em Sobre, Privacidade e Termos
- **Sobre** reescrita: o que o site oferece, de onde vêm os resultados, princípios, quem escreve e como o site se mantém (AdSense e lotérica parceira). Dados estruturados `Organization`
- **Termos de uso** completos: natureza informativa, resultados, ferramentas, idade mínima, anúncios, links externos, propriedade intelectual, responsabilidade e legislação
- Rodapé: Sobre o Pimba, Contato, Blog, Jogo responsável, Privacidade e cookies, Termos de uso
- **Sitemap** com 58 endereços e `lastmod` pela data de cada artigo. Conferido: robots.txt libera tudo menos `/api/`, e só a 404 e a página offline têm `noindex` (teste garante)
- 10 testes novos (55 no total)

## v1.5.0 — 2026-11-22
Gerador com modos: Aleatório puro, Quentes, Frios e Equilibrado, usando as estatísticas da v1.1.0.
- **Quentes:** dá mais peso aos números que mais saíram nos últimos 10, 25, 50 ou 100 concursos (o usuário escolhe). **Frios:** mais peso aos que estão há mais tempo sem sair (no Super Sete, aos que menos saíram em cada coluna). Trevos da +Milionária e Mês de Sorte também seguem o modo
- **Peso pela posição no ranking:** o número mais quente (ou mais frio) fica até 9x mais provável de entrar no jogo que o último, mas todo número continua possível, então os jogos variam a cada clique
- **Equilibrado:** pares e ímpares na mesma medida e números espalhados pelas 5 faixas do volante (Super Sete: 3 ou 4 pares e dígitos variados). Não precisa de internet
- **Aviso honesto em cada jogo gerado:** "Isso não muda sua chance: em cada sorteio todos os números têm a mesma probabilidade. É só por diversão." Nenhum texto promete chance maior (teste garante)
- Sem internet ou com a CAIXA fora do ar, Quentes/Frios avisam e geram no Aleatório puro. O modo fica no endereço (`/gerador/?l=mega-sena&modo=quentes`), dá para compartilhar
- **SEO:** página do gerador com novo título ("números quentes e frios"), seção "Os modos do gerador", links para as estatísticas de cada loteria e FAQ com dados estruturados (FAQPage). Páginas de estatísticas passam a se chamar "Números que mais saem na <loteria>" e ganham os atalhos "Gerar com os quentes" e "Gerar com os frios"
- Lógica dos modos em `assets/js/modos.js`; 10 testes novos (45 no total)

## v1.4.1 — 2026-11-15
Correção: no celular a página "escapava" para o lado (rolagem horizontal). Ajuste pontual, sem mudar o visual.
- **Causa principal:** abaixo de 920px a grade `.layout-2` (resultados e estatísticas) virava `1fr`, que deixa a coluna crescer até o item mais largo. Agora é `minmax(0, 1fr)`, e a coluna respeita a largura da tela
- **Tabelas de premiação, Loteca e Federal** (resultado e conferidor) agora ficam dentro de `.tabela-rolagem`: quando não cabem, rolam dentro do próprio quadro em vez de empurrar a página
- **Tabelas mais compactas em telas até 480px** (menos espaçamento nas células), e a premiação passa a caber sem rolar
- **Links longos na Política de Privacidade** quebram linha (`overflow-wrap: anywhere`)
- Conferido nas 42 páginas a 320px e 360px de largura: nenhuma passa da tela. 2 testes novos (35 no total)
- Versão nova também troca o `?v=` do CSS/JS e o cache do service worker, então quem já instalou o app recebe a correção

## v1.4.0 — 2026-11-15
App Android: o site virou PWA instalável e está pronto para ser empacotado (TWA) e publicado na Google Play.
- **Manifesto do app** (`/manifest.webmanifest`): nome, cores, ícones 192/512 (normal e *maskable*) e atalhos para Resultados, Conferidor, Gerador e Calendário
- **Service worker** (`/sw.js`): conferidor, gerador, calendário e páginas institucionais abrem sem internet. **Resultados, estatísticas e a API nunca saem do cache**: sem conexão aparece a página "Você está sem internet" (`/offline/`), para ninguém ver número velho como se fosse o último
- **Botão "Instalar o app"** no rodapé, quando o Chrome permite instalar; vira "Baixe o app na Play Store" quando `app.playStoreUrl` for preenchido
- **Modo app Android:** o app abre em `/?origem=android`; nele somem o botão "Comprar cota no Loterias CAIXA" e o WhatsApp de bolões da lotérica, e aparece um aviso sem link. Motivo: a política de jogos de azar da Google Play não aceita app sem licença de apostas levando à compra de cotas. No site nada muda
- **`/.well-known/assetlinks.json`** servido pelo Worker a partir de `app.sha256` em `src/config.js` (404 enquanto vazio; o build recusa impressão digital no formato errado)
- **`android/twa-manifest.json`** para o Bubblewrap (pacote `br.com.pimba.app`) e `.gitignore` que impede subir a chave de assinatura
- **Ícone da Play (512x512) e imagem de destaque (1024x500)** em `assets/img/app/`, gerados por `scripts/gerar-icones.mjs`
- **Guia `docs/ANDROID.md`**: conta de desenvolvedor, gerar o AAB (PWABuilder ou Bubblewrap), formulários da Play Console, ligar o app ao site e textos prontos para a ficha da loja
- Código do app em `scripts/app.mjs`; 7 testes novos (33 no total)

## v1.3.0 — 2026-11-15
Google AdSense ligado (editor `ca-pub-6982528073256938`).
- **Script do AdSense no `<head>` de todas as páginas** (42), igual ao código do painel
- **`/ads.txt`** na raiz: `google.com, pub-6982528073256938, DIRECT, f08c47fec0942fa0`
- **Espaços de anúncio** com rótulo "Publicidade": abaixo do resultado de cada loteria, no meio das páginas de estatísticas, e nos espaços já previstos (home, conferidor, gerador, chances, calendário)
- Os espaços só aparecem quando houver ID de bloco em `adsenseSlots` (`src/config.js`). `padrao` vale para todos; `resultado` e `estatisticas` podem ter blocos próprios. Sem ID, ficam só os anúncios automáticos, se ligados no painel
- **Longe da lotérica:** o anúncio da home saiu de baixo do bloco da Sorte Milionária e foi para depois das ferramentas; a página `/boloes/` continua sem anúncio. Teste garante as duas coisas
- **Política de privacidade e cookies** reescrita para o AdSense e a LGPD: cookies de terceiros do Google, como desativar anúncios personalizados, link "como o Google usa dados", bases legais, transferência internacional, direitos e ANPD. Link no rodapé virou "Privacidade e cookies"
- Código do AdSense separado em `scripts/anuncios.mjs`; 6 testes novos (26 no total)

## v1.2.0 — 2026-11-14
Lotérica parceira ativada: Sorte Milionária Loterias (Goiânia/GO).
- **Bloco da lotérica na home** (logo depois dos últimos resultados) e **na página `/boloes/`**, com endereço, link para o mapa, e-mail, CNPJ e razão social
- **Botão "Comprar cota no Loterias CAIXA"**: leva ao canal oficial da CAIXA, onde o cliente compra a cota dos bolões da lotérica e recebe o recibo oficial. Enquanto não houver link direto da lotérica, abre o portal oficial com a instrução "entre em Bolões e escolha a Sorte Milionária Loterias"
- Passo a passo "Como comprar sua cota" em `/boloes/`
- O site **não vende cotas**: o build recusa qualquer `linkBoloesCaixa` que não seja de `*.caixa.gov.br`, e os avisos "não é a CAIXA, não vende cotas, +18" aparecem junto do bloco
- Botões de WhatsApp da lotérica e do grupo de avisos aparecem sozinhos quando `whatsapp` e `grupoWhatsapp` forem preenchidos em `src/config.js`
- Dados estruturados `Store` (SEO local) na página de bolões
- Código do bloco separado em `scripts/parceiro.mjs`; 5 testes novos (20 no total)
- Endereço tirado do cadastro público do CNPJ (Receita Federal). Faltam: horário, WhatsApp, grupo de avisos e link direto dos bolões no Loterias CAIXA

## v1.1.0 — 2026-11-14
Estatísticas e calendário de sorteios.
- **Estatísticas** (`/estatisticas/` e `/estatisticas/<loteria>/`, 9 loterias): números mais e menos sorteados, há mais tempo sem sair e mapa de frequência de todos os números nos últimos 10, 25, 50 ou 100 concursos. Inclui trevos (+Milionária), Mês de Sorte, Time do Coração, os dois sorteios da Dupla Sena e contagem por coluna no Super Sete
- Aviso honesto em destaque e FAQ (com dados estruturados): estatística não aumenta a chance de ganhar
- Nova rota `GET /api/estatisticas/<loteria>?n=50`. O Worker guarda o histórico dos últimos 100 concursos numa única entrada de cache por loteria e completa no máximo 36 concursos por requisição, dentro do limite de 50 subrequests do plano grátis
- Página de estatísticas renderizada no servidor (janela padrão de 50 concursos) para o Google
- **Calendário** (`/calendario/` e `/calendario/<loteria>/`, 10 loterias): grade da semana com destaque para hoje, tabela com a data oficial do próximo concurso (vinda da CAIXA) e próximas datas calculadas no horário de Brasília. FAQ com dados estruturados
- Links novos no menu, na home (ferramentas), no rodapé e nas páginas de resultado; todas as páginas novas entram no sitemap
- **Correção:** dias e horários de sorteio atualizados para a grade vigente desde 19/07/2026 (sábado passou para domingo às 11h; dias úteis às 21h; Federal às 20h). Os dias agora são gerados a partir de um único campo `sorteios` em `assets/js/loterias.js`
- `previews: {}` no wrangler.jsonc, exigido pelos builds de branch do Cloudflare (`wrangler preview`)
- 7 testes novos (15 no total)

## v1.0.0 — 2026-11-13
Primeira versão sem WordPress.
- Resultados das 11 loterias da CAIXA (último concurso e qualquer concurso anterior), renderizados no servidor para SEO
- Home com últimos resultados e "maior prêmio em jogo"
- Conferidor de apostas (dezenas, Dupla Sena com 2 sorteios, +Milionária com trevos, Super Sete por colunas)
- Gerador de números aleatórios (criptográfico) com aviso honesto sobre chances
- Página de chances reais (probabilidades calculadas para todas as faixas)
- Página de bolões com bloco configurável da lotérica parceira (canal oficial CAIXA)
- Páginas institucionais: sobre, jogo responsável, privacidade (LGPD), termos
- Redirecionamentos das URLs do WordPress/WooCommerce antigo
- Espaços de AdSense e Google Analytics prontos (ligar em `src/config.js`)
- Sitemap, robots, Open Graph, dados estruturados (FAQ, breadcrumb)
