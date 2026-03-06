# phi-management

## Supabase Setup

### 1) Credenciais do projeto correto

No Supabase Dashboard, acesse **Settings -> API** e copie:

- `Project URL` -> usar em `NEXT_PUBLIC_SUPABASE_URL`
- `Project API keys -> anon public` -> usar em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Exemplo em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nbgbqgujjjylbjhzafs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key_aqui
```

Se o host nao contiver `nbgbqgujjjylbjhzafs`, o app em `development` vai mostrar aviso no console e na tela de `/login`.

## Supabase Auth URL Configuration

No painel do Supabase, em **Auth -> URL Configuration**, configure:

Para ambiente local:

- `Site URL`: `http://localhost:3000`
- `Redirect URLs`: `http://localhost:3000` e `http://localhost:3000/*`

Para ambiente Vercel (producao):

- `Site URL`: `https://SEU_APP.vercel.app`
- `Redirect URLs`: `https://SEU_APP.vercel.app` e `https://SEU_APP.vercel.app/*`

Sem isso, fluxos de autenticacao em desenvolvimento podem redirecionar para URLs incorretas.
