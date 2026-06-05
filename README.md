# Kulaman School Reports Management System

Production-ready Next.js 15 App Router application for secure school report submission, review, approval, downloads, analytics, notifications, and audit logging.

## Stack

- Next.js 15, TypeScript, Tailwind CSS
- shadcn/ui-style components and Lucide icons
- Supabase Auth, PostgreSQL, Storage, and Row Level Security
- Vercel deployment

## Core roles

- **Admin:** Full management of schools, users, report categories, reports, reviews, downloads, activity logs, settings, and password resets.
- **School Head:** Can view, filter, open, download, approve, and reject all school reports.
- **School Coordinator:** Can update only their own school profile, upload reports, view their own submissions, and delete pending reports only.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project.

3. Copy the environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Fill in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Apply the migrations in order:

   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_storage_policies.sql`

6. Create the first Admin account in Supabase Auth, then insert or update the matching row in `public.users`:

   ```sql
   update public.users
   set role = 'admin', full_name = 'System Administrator', is_active = true
   where email = 'admin@example.com';
   ```

7. Start the app:

   ```bash
   npm run dev
   ```

## Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL.
5. Run the Supabase migrations before first login.
6. Verify the private `reports` storage bucket exists and its policies are active.

## Security model

- Route protection is enforced in `middleware.ts` and server layouts.
- Role checks are enforced again inside server actions.
- Supabase RLS protects every table.
- Storage policies only allow uploads for pending reports and only allow downloads through visible report records.
- School users can only access their assigned school and own reports.
- A database trigger prevents self-service role, school, status, and email changes.
- A database trigger prevents School Coordinators from changing review fields.
- Important events are written to `activity_logs`.
- Admin-created accounts are invited by email and routed through `/auth/confirm` before password setup.

## Production checks

Before customer handoff, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Rotate the Supabase service-role key if it was ever shared outside the deployment environment, then update Vercel environment variables and redeploy.

## Project structure

```text
src/app
  (auth)                 Login, reset, update password
  (dashboard)/admin      Admin dashboard and management pages
  (dashboard)/school     School Coordinator dashboard and workflows
  (dashboard)/school-head School Head dashboard and review pages
src/actions              Server actions for auth, admin, reports, notifications
src/components           App shell, forms, tables, charts, UI primitives
src/lib                  Auth helpers, Supabase clients, queries, validators
src/types                Shared database types
supabase/migrations      Schema, RLS policies, storage policies
```

## Validation and files

Forms are validated with Zod. Report uploads allow PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, and JPEG files up to 25 MB each. Files are stored in a private Supabase Storage bucket and opened through signed URLs.
