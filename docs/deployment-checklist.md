# Deployment Checklist

## Supabase

- Create project.
- Apply both SQL migrations.
- Confirm `reports` bucket is private.
- Create the first Admin account.
- Add all 25 schools in Admin > Schools.
- Add the School Head account in Admin > Users.
- Add one School User account per school.
- Confirm RLS is enabled on all application tables.

## Vercel

- Import repository.
- Add environment variables.
- Set production domain.
- Set `NEXT_PUBLIC_APP_URL` to the production domain.
- Deploy.

## Smoke test

- Admin can sign in and create a school user.
- School User can update only their school profile.
- School User can upload a valid report file.
- School User cannot view another school report.
- School Head can view all reports.
- School Head can approve and reject reports with remarks.
- Report submitter receives a notification.
- Signed preview/download links open files.
- Activity logs record login, upload, review, and management actions.
