# App Android do Pimba (v1.4.0)

O app é o próprio site aberto em tela cheia pelo Chrome do celular (TWA, *Trusted Web Activity*). Não existe um segundo código para manter: tudo que for publicado no site aparece no app na hora. Só é preciso gerar um novo pacote quando mudar ícone, nome ou cores.

O que já está pronto no site:

| Peça | Onde |
|---|---|
| Manifesto do app (nome, cores, ícones, atalhos) | `/manifest.webmanifest`, gerado por `scripts/app.mjs` |
| Funciona sem internet nas ferramentas (conferidor, gerador, calendário) | `/sw.js` |
| Resultados nunca aparecem velhos: sem internet, mostra a página "Você está sem internet" | `/sw.js` + `/offline/` |
| Botão "Instalar o app" no rodapé (aparece quando o Chrome permite) | `assets/js/app.js` |
| Ligação do app com o site (tira a barra de endereço do topo) | `/.well-known/assetlinks.json`, servido pelo Worker a partir de `SITE.app.sha256` |
| Configuração do pacote Android | `android/twa-manifest.json` (pacote `br.com.pimba.app`) |
| Ícone da Play (512x512) e imagem de destaque (1024x500) | `assets/img/app/play-icone-512.png` e `play-destaque-1024x500.png` |

## Por que o botão "Comprar cota" some dentro do app

A política de jogos de azar com dinheiro real da Google Play só permite app que leve a apostas (loteria incluída) quando ele é de um operador licenciado e aprovado pelo Google no país. O Pimba é um site de informação, não um operador. Um botão que leva para a compra de cotas, mesmo no canal oficial da CAIXA, é exatamente o tipo de coisa que faz a Play recusar ou remover o app.

Por isso, só dentro do app Android:

- some o bloco da lotérica parceira com o botão "Comprar cota no Loterias CAIXA" (home e `/boloes/`)
- some o WhatsApp de bolões da lotérica (bloco e página Sobre)
- no lugar aparece um aviso sem link: "Cotas de bolão oficiais são vendidas só nas lotéricas credenciadas e nos canais da CAIXA... O app do Pimba é apenas informativo e não vende cotas. Nossa lotérica parceira é a Sorte Milionária Loterias, em Goiânia/GO."

No site (celular ou computador) e no app instalado pelo próprio Chrome, nada muda: o botão continua lá. A parceria segue gerando visita pelo site, que é onde está o tráfego do Google.

Como o site sabe que está dentro do app: o app abre em `/?origem=android` e o Chrome informa que veio do pacote `br.com.pimba.app`. Essa marca fica guardada só naquela aba do app (não afeta o Chrome comum do usuário). Para esconder qualquer outra coisa no app, basta colocar `data-fora-do-app` no elemento.

## Passo 1. Conta de desenvolvedor Google Play

1. Acesse [play.google.com/console](https://play.google.com/console) e crie a conta (taxa única de US$ 25, cartão internacional).
2. Escolha o tipo de conta:
   - **Pessoal:** mais simples, mas contas novas precisam fazer um **teste fechado com pelo menos 12 testadores por 14 dias seguidos** antes de liberar o app para todo mundo. Dá para chamar amigos e família (cada um aceita o convite pelo e-mail da conta Google e instala o app).
   - **Organização (empresa):** não tem a exigência dos 12 testadores, mas pede CNPJ e número D-U-N-S (gratuito, pedido no site da Dun & Bradstreet, demora alguns dias).
3. A Google vai pedir verificação de identidade (documento com foto). Pode levar alguns dias.

## Passo 2. Gerar o pacote (AAB)

### Opção A, mais fácil: PWABuilder (pelo navegador, sem instalar nada)

1. Depois do merge e do deploy desta versão, abra [pwabuilder.com](https://www.pwabuilder.com), digite `https://pimba.com.br` e clique em **Start**.
2. Clique em **Package for stores → Android → Generate Package** e ajuste em **All settings**:
   - Package ID: `br.com.pimba.app`
   - App name: `Pimba — Resultados das Loterias` · Short name: `Pimba`
   - Version: `1.4.0` · Version code: `1`
   - Start URL: `/?origem=android` (importante: é isso que esconde o botão de compra no app)
   - Display: Standalone · Notifications: desligado
   - Signing key: **Create new**. Preencha seu nome e organização "Pimba".
3. Baixe o `.zip`. Dentro dele vêm o `.aab` (é o que vai para a Play), a chave `signing.keystore` e o `signing-key-info.txt` com as senhas.

> **Guarde a chave e as senhas em lugar seguro (e fora do GitHub).** Sem elas não dá para enviar atualizações do app. A Play tem recuperação da chave de upload, mas dá trabalho.

### Opção B: Bubblewrap (linha de comando, usa o `android/twa-manifest.json` do repositório)

Precisa de Node 18+. Na primeira vez o Bubblewrap baixa sozinho o Java e o SDK do Android.

```bash
npm install -g @bubblewrap/cli
cd android
# cria a chave de upload (uma vez só; anote as senhas)
keytool -genkeypair -v -keystore pimba-upload.keystore -alias pimba -keyalg RSA -keysize 2048 -validity 10000
bubblewrap update --skipVersionUpgrade   # gera o projeto Android a partir do twa-manifest.json
bubblewrap build                          # gera app-release-bundle.aab (e um .apk para testar)
```

O `.gitignore` da pasta `android/` já impede que a chave e o projeto gerado subam para o GitHub. Para atualizar o app depois, aumente `appVersionCode` (2, 3...) e `appVersionName` em `android/twa-manifest.json` e rode `bubblewrap update` e `bubblewrap build` de novo.

## Passo 3. Criar o app na Play Console e enviar

1. **Criar app:** nome "Pimba — Resultados Loterias" (a Play aceita até 30 caracteres), idioma português (Brasil), tipo App, gratuito.
2. **Testar e lançar → Testes → Teste fechado** (ou Teste interno para começar): crie uma versão e envie o `.aab`. Aceite a **Assinatura de apps do Google Play** quando perguntar.
3. Preencha **Conteúdo do app** (menu da esquerda):
   - **Política de privacidade:** `https://pimba.com.br/privacidade/`
   - **Anúncios:** sim, o app contém anúncios (AdSense)
   - **Público-alvo:** somente 18 anos ou mais
   - **Classificação do conteúdo:** responda com sinceridade que o app mostra resultados e informações sobre loterias, **mas não permite apostar nem comprar** apostas. Pode sair com classificação alta (16 ou 18), o que é coerente com o público
   - **Segurança dos dados:** o Pimba não pede cadastro. Declare o que a política de privacidade já diz: o Google (AdSense e, se ligado, Analytics) coleta identificadores do dispositivo e dados de uso para anúncios e estatísticas; dados criptografados em trânsito; o usuário não consegue pedir exclusão no app porque não há conta
   - **App de notícias:** não
4. **Ficha da loja principal:** use os textos abaixo, o ícone `assets/img/app/play-icone-512.png`, a imagem de destaque `assets/img/app/play-destaque-1024x500.png` e pelo menos 2 capturas de tela do celular (abra o app de teste e tire prints das telas de resultado, conferidor e estatísticas). Categoria sugerida: **Entretenimento**.

## Passo 4. Ligar o app ao site (tira a barra de endereço)

Até este passo, o app abre com uma barrinha de endereço do Chrome no topo. Para sumir:

1. Na Play Console: **Testar e lançar → Configuração → Integridade do app → Assinatura de apps**.
2. Copie o **SHA-256** do "Certificado da chave de assinatura do app" e também o da "chave de upload".
3. Cole os dois em `src/config.js`:

```js
app: {
  ...
  sha256: [
    'AA:BB:CC:...', // chave de assinatura do app (Play)
    'DD:EE:FF:...', // chave de upload (sua)
  ],
},
```

4. Faça o commit na `main` (ou me peça). O deploy publica `https://pimba.com.br/.well-known/assetlinks.json` sozinho. O build recusa impressão digital no formato errado, para não derrubar o app.
5. Confira em: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://pimba.com.br&relation=delegate_permission/common.handle_all_urls` (precisa aparecer `br.com.pimba.app`). Feche e abra o app: a barra some.

## Passo 5. Produção

Com conta pessoal: depois de 14 dias de teste fechado com 12 testadores, a Play libera o botão **Solicitar acesso à produção** no Painel. Responda o questionário, envie a mesma versão para **Produção** e aguarde a revisão (de algumas horas a alguns dias).

Quando o app estiver no ar, cole o link da ficha em `SITE.app.playStoreUrl` (`src/config.js`): o rodapé do site passa a mostrar "Baixe o app na Play Store".

## Cuidados para não ter o app recusado

- Não coloque no app nenhum link de compra de aposta ou cota (se criar algum, marque com `data-fora-do-app`).
- No AdSense, bloqueie a categoria sensível **Jogos de azar e apostas** (Controle de bloqueio → Todos os sites → Categorias sensíveis). Assim o app não exibe anúncio de cassino ou bet, que a Play também vigia.
- Na descrição, deixe claro que o Pimba não é a CAIXA e não vende apostas. Não use a marca ou o logo da CAIXA no ícone ou nas imagens.
- Se a Play recusar, ela manda o motivo por e-mail. Me mande o texto que eu ajusto.

## Textos para a ficha da Play Store

**Nome (até 30 caracteres):** Pimba — Resultados Loterias

**Descrição curta (até 80):** Resultados da Mega-Sena, Lotofácil, Quina e mais. Confira seu jogo em segundos.

**Descrição completa:**

> O Pimba mostra os resultados de todas as loterias da CAIXA num lugar só, minutos depois de cada sorteio: Mega-Sena, Lotofácil, Quina, +Milionária, Lotomania, Timemania, Dupla Sena, Dia de Sorte, Super Sete, Loteca e Federal.
>
> • Último resultado e concursos anteriores, com quanto pagou cada faixa e o prêmio acumulado
> • Conferidor: digite seus números e veja na hora quantos acertou
> • Gerador de números aleatórios
> • Estatísticas: números mais e menos sorteados e há quanto tempo cada um não sai
> • Calendário com os dias e horários dos próximos sorteios
> • Chances reais de ganhar em cada loteria, sem promessa milagrosa
>
> O Pimba é um app independente de informação. Não é a CAIXA, não vende apostas nem cotas e não tem vínculo com as Loterias CAIXA. Confira sempre o resultado no canal oficial antes de descartar seu bilhete. Proibido para menores de 18 anos. Jogue com responsabilidade.
