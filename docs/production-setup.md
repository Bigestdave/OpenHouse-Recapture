# OpenHouse production setup

This is the one-time setup needed to switch from the visual demo to the persisted MVP. Keep all secrets in Supabase or the deployment host; only the Supabase URL and publishable key belong in the Vite environment.

## 1. Create the Supabase project

1. Create a new Supabase project for OpenHouse.
2. In the SQL editor, run [`supabase/schema.sql`](../supabase/schema.sql).
3. Run the migrations in timestamp order:
   - [`20260901000000_production_security.sql`](../supabase/migrations/20260901000000_production_security.sql)
   - [`20260901010000_workflow_data_model.sql`](../supabase/migrations/20260901010000_workflow_data_model.sql)
   - [`20260901020000_auditable_evidence_analysis.sql`](../supabase/migrations/20260901020000_auditable_evidence_analysis.sql)
4. Do **not** run `supabase/seed.sql` in production. It is demo-only data.

## 2. Configure browser variables

Create `.env.local` from `.env.example`:

```env
VITE_OPENHOUSE_MODE=production
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

Restart Vite after changing the file. Open `/#/diagnostics`; it should show production mode and configured Supabase browser access.

## 3. Configure Edge Functions

The project needs two functions: `openhouse-workflow` and `openhouse-ai`. Both are already deployed for the current OpenHouse project. For each function, open **Edge Functions → function → Settings**, turn **Verify JWT with legacy secret** off, then save. The functions validate signed-in users themselves, while `openhouse-workflow` also has deliberately public routes for capture links, published property pages, and booking requests.

Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` inside every Edge Function. Those reserved names cannot be created manually, and must never be added to browser variables.

In **Edge Functions → Secrets**, set only the optional application secrets:

| Secret | Value |
| --- | --- |
| `GEMINI_API_KEY` | Optional for now; required only when enabling real Gemini analysis. |
| `GEMINI_MODEL` | Optional; defaults to `gemini-3.7-flash`. |
| `OPENHOUSE_ALLOWED_ORIGIN` | Your app URL, for example `https://app.example.com`. Leave unset during local testing. |

Never add `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to a Vite `.env` file.

If you need to redeploy later, use the local `supabase/functions/` source with the Supabase CLI or the Dashboard editor. The repository includes `supabase/config.toml` so both functions retain their intentional JWT setting.

## 4. Configure authentication

1. In Supabase Auth, set the site URL and allowed redirect URLs for the deployed app.
2. Enable email/password authentication.
3. Create a real realtor account through the app.
4. Complete onboarding to create the first workspace. The workspace owner membership is created by the database trigger.

## 5. Smoke test the real MVP

1. Sign in with the real account.
2. Import a property at `/#/add-property` with at least one image, video, or floor plan.
3. Confirm the property appears at `/#/properties` after refresh.
4. If a room is marked missing, open its capture link in an incognito browser and upload a short video.
5. Confirm the property reaches **Ready for review**.
6. Publish from the property page and open the generated public link in an incognito browser.
7. Submit a booking and verify it appears in the `bookings` table.

## Before launch

- Set `OPENHOUSE_ALLOWED_ORIGIN` to the exact production domain instead of `*`.
- Add CAPTCHA or equivalent bot protection to public booking.
- Add a background worker and retries for actual Gemini analysis and experience building.
- Configure error monitoring, backups, a privacy policy, and a data-retention policy.
- Connect one real notification provider and one listing-source provider only after this loop is stable.
