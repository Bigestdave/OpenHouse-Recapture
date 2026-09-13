# Judge demo and production environments

Keep these as two separate deployments of the same codebase.

## Judge demo

Create a separate Vercel project or a dedicated preview deployment with:

```text
VITE_OPENHOUSE_MODE=demo
```

The demo is intentionally offline and seeded. Judges can use **Quick demo login** or sign in as `david@openhouse.com` with any password; it does not read or write your real Supabase workspace.

## Production

Use a different production deployment with:

```text
VITE_OPENHOUSE_MODE=production
VITE_SUPABASE_URL=https://zccbaaqorivemlakghma.supabase.co
VITE_SUPABASE_ANON_KEY=<your Supabase publishable/anon key>
```

Do not put the Gemini key, Supabase service-role/secret key, MLS credentials, or CRM credentials in Vercel client variables. Gemini remains in the `openhouse-ai` Edge Function, and provider credentials belong in server-side secrets or OAuth storage.

## Required Supabase deployment

Before production uses listing imports and job retry progress, apply these migrations and deploy both functions:

```powershell
npx supabase db push --project-ref zccbaaqorivemlakghma
npx supabase functions deploy openhouse-workflow --project-ref zccbaaqorivemlakghma --no-verify-jwt
npx supabase functions deploy openhouse-ai --project-ref zccbaaqorivemlakghma --no-verify-jwt
```

The local CLI must first be authenticated with a Supabase personal access token (`SUPABASE_ACCESS_TOKEN`) or `npx supabase login`.

For automatic analysis retries, also set a high-entropy `OPENHOUSE_WORKER_SECRET` as an Edge Function secret and schedule a trusted server-side request every five minutes:

```text
POST https://zccbaaqorivemlakghma.supabase.co/functions/v1/openhouse-ai
x-openhouse-worker-secret: <OPENHOUSE_WORKER_SECRET>
Content-Type: application/json

{"action":"process_due_retries"}
```

Use a scheduler that can keep that header secret (Supabase Cron + Vault, GitHub Actions secrets, or another server-side scheduler). Never call this endpoint from the browser.

