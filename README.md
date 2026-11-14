# Arbre Bio website

Public marketing site plus four internal tools, built with Astro and Supabase and deployed on Vercel.

| Area | Path | Who signs in |
| --- | --- | --- |
| Public site (EN/FR/ES/AF), blog, careers | `/`, `/[lang]/…` | nobody |
| Admin panel (orders, inventory, sales validation, blog, HR, payroll) | `/admin/` | rows in `admin_profiles` |
| Sales-agent portal (PWA) | `/sales-agent/` | rows in `sales_agent_profiles` |
| Terrain field-operations platform | `/terrain/` | rows in `terrain_profiles` |
| Applicant / employee portal | `/careers/portal/` | e-mail + reference token |

## Commands

```sh
npm install
npm run dev      # local dev server on :4321
npm run check    # type check
npm test         # unit tests (vitest)
npm run build    # type check + production build
```

## Configuration

Copy `.env.example` to `.env` and fill it in. The same variables must be set in Vercel.

## Database

SQL migrations live in `supabase/migrations/` and are applied by pasting them into the Supabase SQL editor, in file-name order. They are written to be safe to re-run.

How access is enforced:

- Every `/api/**` route runs server-side with the service-role key and checks the caller itself (`requireAdminAuth`, `requireTerrainAuth`, or the agent token check). Authentication is by `Authorization: Bearer <Supabase access token>` only — never cookies.
- Row-level security is the second line of defence for anyone calling Supabase directly with the public anon key. Admin tables are restricted with `is_admin()`; Terrain tables are service-role only.
- A new table needs RLS enabled and an explicit policy. `USING (true)` for `authenticated` means "every sales agent and field technician", not "admins".

## Deploying

```sh
npx vercel deploy --prod
```

Deploy code first, then apply any new migration: the API code is written to work both before and after its migration is applied.
