# Changelog — Pimba

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
