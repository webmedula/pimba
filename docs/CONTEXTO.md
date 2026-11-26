# Pimba (pimba.com.br) — contexto do projeto · v1.0.0

Documento de passagem: resume a conversa em que o projeto foi definido e construído, para continuar em outro projeto ou chat. Atualizado em 14/11/2026.

---

## 1. Objetivo

João Paulo (WebMedula) quer reformular o **pimba.com.br** para ganhar dinheiro com o domínio, explorando as **loterias da CAIXA**. Ele tem um **parceiro dono de lotérica**, e o site deve servir de ponte para os serviços e produtos dessa lotérica.

**Situação do site antigo (13/11/2026):** WordPress + WooCommerce 10.7. Tinha gerador de números, cursos, livros, "jogos escolhidos por IA", bolões e newsletter. Vários links do menu apontavam para `#` (incompleto).

---

## 2. Análise e decisões

### Rifa: descartada
- No Brasil, rifa ou sorteio sem autorização do Ministério da Fazenda é **contravenção penal** (Lei de Contravenções Penais, Decreto-Lei 3.688/1941, e Decreto-Lei 6.259/1944).
- Uma empresa comercial na prática não consegue essa autorização (só casos como filantrópicas).
- Pena citada pela imprensa: prisão de 3 meses a 2 anos e multa de R$ 2 mil a R$ 200 mil. Quem organiza e quem divulga podem ser responsabilizados.
- Alternativa legal para sortear prêmios: **promoção comercial autorizada** ("compre e concorra", Lei 5.768/71). Exige processo próprio e advogado.

### Bolões: só pelo canal oficial
- **Seguro:** desde 2024 a CAIXA vende cotas de bolões montados pelas lotéricas no portal/app Loterias CAIXA, com recibo individual. O cliente pode escolher a lotérica. O Pimba divulga os bolões do parceiro e manda o cliente comprar lá.
- **Área cinzenta (evitar):** o site vender cotas direto, como fazem os intermediários (Sorte Online etc.). A Fazenda entende que intermediação não é exploração, e a Justiça de SP arquivou um inquérito pedido pela CAIXA. Mas a CAIXA processa esses sites e há risco de **descredenciar a lotérica** parceira. O parceiro deve checar o contrato de permissão dele.

### Modelo de receita escolhido
1. **Tráfego de busca (SEO):** resultados, conferidor, estatísticas, calendário. A demanda se repete a cada sorteio. Monetização com AdSense (mesma estratégia do rendaonline.org).
2. **Lista de WhatsApp/e-mail** ("resultado e bolões da semana"), que vira canal de venda para a lotérica parceira (comissão ou valor fixo combinado entre eles).
3. **Página local da lotérica** (pagamento de contas, Pix etc.) como complemento, não como receita principal.

### Cuidados de conteúdo
- Cursos e "jogos por IA" que prometem mais chance de ganhar podem configurar propaganda enganosa. Foram retirados. O gerador ficou com aviso honesto.
- O site deixa claro que **não é a CAIXA, não vende apostas** e é para maiores de 18 anos.

*(Não é parecer jurídico: serve de base para conversar com um advogado.)*

### Decisões técnicas
- **Sem WordPress:** site estático + **Cloudflare Worker**, no mesmo padrão do webmedula-site.
- Código no repositório **github.com/webmedula/pimba** (branch `main`).
- **Hospedagem: Cloudflare** em vez do CyberPanel, pelos motivos abaixo.
  - Aguenta os picos de acesso depois do sorteio das 20h sem afetar os sites dos clientes na VPS.
  - Arquivos estáticos são grátis e sem limite. O plano grátis permite 100 mil chamadas ao Worker por dia; o pago custa US$ 5/mês.
  - Deploy automático a cada push.
- **Plano B, se a API da CAIXA bloquear o Cloudflare:** um intermediário pequeno na VPS da Hostinger (endereço brasileiro) busca os resultados. O resto continua no Cloudflare, e só muda a variável `CAIXA_API_BASE`.
- Outra opção levantada, não escolhida: v1.1.0 com o backend em PHP rodando no CyberPanel.

---

## 3. O que foi construído (v1.0.0)

**Commit:** `38167ed`, "Pimba v1.0.0 — site novo sem WordPress".

### Páginas
| Rota | Conteúdo |
|---|---|
| `/` | Últimos resultados das 11 loterias, "maior prêmio em jogo", ferramentas, FAQ |
| `/resultados/` | Índice com o último concurso de cada loteria |
| `/resultados/<loteria>/` | Último resultado (renderizado no servidor) + como jogar + chances |
| `/resultados/<loteria>/<concurso>/` | Qualquer concurso, com título e descrição próprios para SEO |
| `/conferidor/` | Marca os números e mostra acertos e faixa premiada. Cobre Dupla Sena (2 sorteios), +Milionária (trevos) e Super Sete (colunas) |
| `/gerador/` | Números aleatórios (crypto.getRandomValues) com aviso de que não aumentam chances |
| `/boloes/` | Explica o bolão oficial, alerta contra golpes, bloco da lotérica parceira |
| `/probabilidades/` | Ranking de chances e tabelas por faixa |
| `/sobre/`, `/jogo-responsavel/`, `/privacidade/`, `/termos/`, `404` | Institucionais |

**Loterias:** Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, +Milionária, Loteria Federal e Loteca.

### Arquitetura
- `scripts/build.mjs` gera `dist/`: páginas, sitemap, robots, `_redirects` (URLs antigas do WooCommerce e cursos levam para `/`) e `_headers`.
- `worker/index.js`:
  - `/api/resultado/<loteria>[/<concurso>]` e `/api/resultados` buscam na API da CAIXA (`servicebus3.caixa.gov.br/portaldeloterias/api/<loteria>[/<n>]`, o mesmo do site oficial; o `servicebus2` fica de reserva desde a v1.6.4), normalizam e guardam em cache (5 min para o último concurso, 30 dias para os antigos).
  - `/resultados/...` é renderizado com HTMLRewriter.
  - `www` redireciona para a raiz.
- `assets/js/loterias.js`: preços (out/2026), dias de sorteio, regras e probabilidades calculadas (batem com as oficiais).
- `assets/js/render.js`: normalização e HTML (usado no Worker e no navegador).
- `assets/js/conferir.js`: lógica do conferidor.
- `src/config.js`: **configurações editáveis** (parceiro, WhatsApp, AdSense, Analytics, e-mail).
- `test/`: 8 testes (`npm test`) e uma API falsa da CAIXA (`npm run mock`) para testar localmente.
- Visual: azul-marinho #101935 + amarelo #FFC93C, fonte Outfit (hospedada no próprio site), logo "pimba!" com bola de loteria.

### Preços usados (aposta mínima, out/2026)
| Loteria | Preço |
|---|---|
| Dia de Sorte | R$ 2,50 |
| Quina, Lotomania, Dupla Sena, Super Sete | R$ 3,00 |
| Lotofácil, Timemania | R$ 3,50 |
| Loteca | R$ 4,00 |
| Mega-Sena, +Milionária | R$ 6,00 |

Atualizar quando a CAIXA reajustar.

---

## 4. Status em 14/11/2026

- [x] Código completo no GitHub (`webmedula/pimba`)
- [x] Testado localmente com dados falsos: rotas, renderização no servidor, conferidor, gerador, visual em desktop e celular
- [ ] **Deploy no Cloudflare.** Travado: ao abrir "Domínios → Visão geral" na conta WebMedula, o painel mostrou "Sem acesso". Conferir a conta selecionada e o papel do usuário (Gerenciar conta → Membros).
- [ ] Testar a API real da CAIXA em `pimba.<conta>.workers.dev/resultados/mega-sena/`. A API não pôde ser acessada do ambiente de desenvolvimento.
- [ ] Colocar o pimba.com.br no Cloudflare: adicionar o domínio e trocar os nameservers no Registro.br, preservando os registros MX se houver e-mail. Depois ligar `pimba.com.br` e `www` ao Worker.
- [ ] Desligar o WordPress antigo só depois que o site novo estiver respondendo no domínio.
- [ ] A tag `v1.0.0` não foi enviada ao GitHub (a conexão recusou o push da tag).

### Passos do deploy
Workers & Pages → Criar → Importar repositório `webmedula/pimba`, branch `main`.
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

## 5. Próximos passos

1. Resolver o acesso ao Cloudflare, fazer o deploy e testar a API da CAIXA (se bloquear, aplicar o plano B).
2. **v1.0.1:** ativar a lotérica parceira em `src/config.js`. Faltam: nome, cidade, endereço, horário, WhatsApp e o link da página de bolões dela no Loterias CAIXA. Também o link do grupo de WhatsApp da lista de avisos.
3. AdSense e Google Analytics quando as contas estiverem prontas (os IDs vão em `src/config.js`).
4. Ideias para versões futuras:
   - Página de estatísticas (números mais sorteados nos últimos N concursos, com cache).
   - Calendário de sorteios.
   - Captação de e-mails.
   - Conteúdo de blog para SEO (Mega da Virada, como receber prêmio, etc.).
5. Preferência do João Paulo: **sempre versionar as entregas** (no nome do arquivo e no conteúdo) e registrar no CHANGELOG.

## 6. Fontes consultadas
- Estado de Minas, rifas online: https://www.em.com.br/trends/2026/08/7483236-rifas-on-line-o-que-e-ilegal-e-como-fazer-de-forma-legal.html
- Correio Braziliense, rifas ilegais: https://www.correiobraziliense.com.br/aqui/?p=37276
- Aos Fatos, rifas ilegais: https://www.aosfatos.org/noticias/rifas-ilegais-instagram/
- BNLData, bolão online no portal da CAIXA: https://bnldata.com.br/clientes-podem-comprar-cotas-dos-boloes-feitos-pelas-lotericas-no-portal-ou-no-app-loterias-caixa/
- BNLData, Cade e intermediação: https://bnldata.com.br/?p=182155
- BNLData, inquérito arquivado: https://bnldata.com.br/justica-contraria-caixa-e-arquiva-inquerito-contra-sites-de-bolao/
- Diário do Nordeste, reajuste de preços: https://diariodonordeste.verdesmares.com.br/loterias/caixa-reajusta-valores-de-apostas-da-mega-sena-e-outras-loterias-veja-novos-precos-1.3666351
- Ache Concursos, preços em 2026: https://www.acheconcursos.com.br/loterias/quanto-custa-jogar-na-mega-sena-quina-lotofacil-e-outras-loterias-em-2026-93786
