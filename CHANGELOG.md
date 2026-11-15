# Changelog — Pimba

## v1.2.1 — 2026-11-15
Nome da lotérica no Loterias CAIXA.
- No portal e no app Loterias CAIXA, a Sorte Milionária aparece com o nome do cadastro, **Neo Broker Imobiliaria (Goiânia - GO)**. O bloco da lotérica (home e `/boloes/`) agora diz isso em destaque e orienta: "entre em Bolões, procure a lotérica Neo Broker Imobiliaria e toque em Ver Bolões"
- Novo campo `parceiro.nomeNaCaixa` em `src/config.js` (vazio = igual ao nome da fachada)
- Nome da fachada "Sorte Milionária" confirmado pelo parceiro
- 1 teste novo (21 no total)

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
