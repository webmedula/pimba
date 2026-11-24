# Changelog — Pimba

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
