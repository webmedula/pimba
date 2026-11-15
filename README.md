# Pimba — pimba.com.br · v1.4.1

Site de resultados das loterias da CAIXA, conferidor de apostas, gerador de números, chances reais e bolões (ponte para a lotérica parceira). Sem WordPress: site estático + Cloudflare Worker.

## Como funciona

| Parte | O que faz |
|---|---|
| `scripts/build.mjs` | Gera todas as páginas em `dist/` (HTML, sitemap, robots, redirecionamentos do WordPress antigo) |
| `worker/index.js` | Serve o site, consulta a API pública da CAIXA com cache e entrega `/resultados/<loteria>/<concurso>/` já renderizado (bom para o Google) |
| `assets/js/loterias.js` | Dados das modalidades: preços, faixas, probabilidades, cores |
| `assets/js/render.js` | Normaliza o JSON da CAIXA e monta o HTML (usado no Worker e no navegador) |
| `assets/js/conferir.js` | Lógica do conferidor (testada) |
| `assets/js/stats.js` | Cálculo e HTML das estatísticas (testado) |
| `assets/js/datas.js` | Calendário: próximas datas no horário de Brasília (testado) |
| `scripts/app.mjs` | App: manifesto do PWA, service worker, assetlinks e "modo app" Android |
| `android/twa-manifest.json` | Configuração do pacote Android (TWA/Bubblewrap). Guia em `docs/ANDROID.md` |
| `src/config.js` | **Configurações editáveis**: lotérica parceira, WhatsApp, AdSense, Analytics, app Android |

### Páginas
`/` · `/resultados/` · `/resultados/<loteria>/` (11 loterias) · `/resultados/<loteria>/<concurso>/` · `/estatisticas/` · `/estatisticas/<loteria>/` (9) · `/calendario/` · `/calendario/<loteria>/` (10) · `/conferidor/` · `/gerador/` · `/boloes/` · `/probabilidades/` · `/sobre/` · `/jogo-responsavel/` · `/privacidade/` · `/termos/`

### API interna
- `GET /api/resultado/<loteria>` — último concurso
- `GET /api/resultado/<loteria>/<concurso>` — concurso específico
- `GET /api/resultados` — último de todas
- `GET /api/estatisticas/<loteria>?n=50` — estatísticas dos últimos 10, 25, 50 ou 100 concursos (`parcial: true` enquanto o histórico ainda está sendo montado no cache)

## Deploy no Cloudflare (igual ao webmedula-site)

1. Cloudflare → **Workers & Pages → Create → Import a repository** → `webmedula/pimba`.
2. Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
3. Depois do primeiro deploy, abra `https://pimba.<sua-conta>.workers.dev/resultados/mega-sena/` e confirme que o resultado real aparece.
4. Em **Settings → Domains & Routes**, adicione `pimba.com.br` e `www.pimba.com.br` (o domínio precisa estar no Cloudflare). O `www` redireciona para a raiz.
5. Desligue o WordPress antigo só depois de confirmar que o site novo responde no domínio.

Todo push na `main` publica sozinho.

## Configurar a lotérica parceira e monetização

Edite `src/config.js`:
- `parceiro`: já ativo com a Sorte Milionária Loterias (v1.2.0). Preencha `horario`, `whatsapp`, `grupoWhatsapp` e `linkBoloesCaixa` (só aceita `*.caixa.gov.br`) quando o parceiro enviar; os botões aparecem sozinhos.
- `whatsappLista`: link do grupo/comunidade de avisos.
- `adsenseClient`: código de editor do AdSense (o script no `<head>` e o `ads.txt` são gerados sozinhos). `adsenseSlots`: IDs dos blocos de anúncio; sem ID, os espaços ficam escondidos. Os anúncios nunca aparecem na página de bolões nem colados no bloco da lotérica.
- `googleAnalyticsId`: quando tiver a conta.
- `app`: app Android. Depois de enviar o app à Play, cole as impressões digitais SHA-256 em `app.sha256` (liga o app ao site) e o link da ficha em `app.playStoreUrl`. Passo a passo completo em [`docs/ANDROID.md`](docs/ANDROID.md).

## Testar localmente

```bash
npm install
npm test                 # testes da lógica
npm run mock             # API falsa da CAIXA na porta 8788 (números fictícios)
echo 'CAIXA_API_BASE=http://127.0.0.1:8788/api' > .dev.vars
npm run dev              # http://127.0.0.1:8787
```

## Observações

- A API usada é a mesma que alimenta o site oficial das Loterias CAIXA. Se um dia ela bloquear o Cloudflare, as páginas continuam no ar com aviso e link para o site oficial; aí trocamos a fonte em `CAIXA_API_BASE`.
- Preços das apostas em `assets/js/loterias.js` (vigentes em out/2026). Atualize quando a CAIXA reajustar.
- Dias e horários de sorteio ficam no campo `sorteios` de cada loteria em `assets/js/loterias.js` (`[dia da semana, hora]`, 0 = domingo). O texto das páginas e o calendário são gerados a partir dele.
- O histórico das estatísticas fica no cache de cada data center do Cloudflare. O primeiro acesso numa região busca até 36 concursos; os seguintes, só o concurso novo.
- O site **não vende apostas nem rifas**: só informa e direciona para os canais oficiais e para a lotérica parceira.
