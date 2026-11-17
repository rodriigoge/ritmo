# Configurar Supabase e login com Google

O Ritmo guarda contas e hábitos no Supabase (Auth + Postgres). O app usa só a
chave pública (publishable key). Quem protege os dados de cada usuário são as
políticas de RLS em `migrations/`. Leva uns 20 minutos na primeira vez.

## 1. Projeto Supabase

1. Em [supabase.com](https://supabase.com), crie um projeto (região mais próxima: São Paulo).
2. Em **Project Settings → API**, copie a **Project URL** e a **Publishable key**.
3. Na raiz do repositório, copie `.env.example` para `.env` e preencha:
   `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 2. Banco de dados

Abra **SQL Editor → New query** e rode, em ordem, cada arquivo de
`migrations/` (cole o conteúdo e clique em **Run**):

1. `20261117120000_create_habits.sql`: tabelas `habits` e `habit_completions`,
   as políticas de acesso por usuário e a função `toggle_habit_completion`.
2. `20261117130000_delete_own_account.sql`: função `delete_own_account`, usada
   em **Perfil → Excluir conta**. Ela apaga só a conta de quem chama e, em
   cascata, os hábitos dessa conta.

Com a [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started),
o equivalente é `npx supabase link --project-ref <id>` e depois `npx supabase db push`.

## 3. Autenticação por e-mail

Em **Authentication**:

- **Sign In / Providers → Email**: deixe ativo, com **Confirm email** ligado.
  Em **Minimum password length**, use `8` para bater com a validação do app.
- **URL Configuration**:
  - **Site URL**: `ritmo://`
  - **Redirect URLs**: adicione `ritmo://**`

  Os e-mails de confirmação e de nova senha abrem o app em
  `ritmo://auth/callback` e `ritmo://reset-password`. O link precisa ser aberto
  no mesmo celular em que foi pedido.
- O SMTP padrão do Supabase envia poucos e-mails por hora e serve para testes.
  Antes de publicar, configure um SMTP próprio em **Project Settings → Auth → SMTP**.

## 4. Login com Google

No [Google Cloud Console](https://console.cloud.google.com):

1. Crie (ou escolha) um projeto e configure a **OAuth consent screen**
   (External, nome "Ritmo" e e-mail de suporte).
2. Em **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   crie os clientes abaixo.

**Web application** (obrigatório, é o que o Supabase valida):

- Copie o **Client ID** para `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` no `.env`.
- No Supabase, em **Authentication → Sign In / Providers → Google**:
  1. Ative o provedor.
  2. Em **Client IDs**, cole o Client ID web (e o de iOS, se houver, separado
     por vírgula).
  3. Em **Client Secret**, cole o segredo do cliente web.

**Android** (obrigatório para Android):

- Package name: `com.ritmo.app` (definido em `app.json`).
- SHA-1: o do certificado que assina o app. Para o build de desenvolvimento
  local, depois do primeiro `npx expo run:android`, rode:

  ```sh
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

  Para builds do EAS, use o SHA-1 mostrado em `npx eas credentials`. Na Play
  Store, use o SHA-1 da chave de assinatura do app (Play Console → App integrity).
  Cada certificado precisa do próprio cliente Android.
- Esse cliente não vai para o `.env`. O Google só confere o pacote e o SHA-1.

**iOS** (só se for rodar no iPhone):

- Bundle ID: `com.ritmo.app`.
- No `.env`, preencha `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` com o Client ID e
  `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME` com o **iOS URL scheme** mostrado pelo
  Google (`com.googleusercontent.apps.…`).
- No provedor Google do Supabase, ative **Skip nonce checks**. O SDK do Google
  no iOS inclui um nonce que o app não controla.

Um erro "não está configurado corretamente" ao tocar em **Continuar com Google**
no Android quase sempre é SHA-1 ou package name divergente no cliente Android.

## 5. Rodar o app

O login nativo do Google usa código nativo, então o app **não roda no Expo Go**.
Use um development build:

```sh
npx expo run:android
```

Isso exige Android Studio e o SDK instalados. Depois de mudar o `.env`,
reinicie o Metro com `npx expo start -c`.

### Pelo EAS (nuvem, sem Android Studio)

O `.env` não é enviado ao EAS (está no `.gitignore`), então as variáveis vão
para os ambientes do EAS. Os perfis estão em `eas.json`:

- `development`: app de desenvolvimento, que carrega o código do `npx expo start`
  pelo Wi‑Fi.
- `preview`: APK que funciona sozinho.

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:push development --path .env
npx eas-cli@latest env:push preview --path .env
npx eas-cli@latest build --profile development --platform android
```

No primeiro build, aceite gerar o Android Keystore. O SHA-1 dele, mostrado em
`npx eas-cli@latest credentials --platform android`, é o que vai no cliente
OAuth Android do Google Cloud. O mesmo keystore assina os dois perfis.

## Dados antigos

Os hábitos que ficavam no SQLite do aparelho (`habitual.db`) não são migrados.
O arquivo é apagado na primeira abertura desta versão.
