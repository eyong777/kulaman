# Supabase Security Notes

## Tables

The schema creates:

- `users`
- `schools`
- `report_categories`
- `reports`
- `report_files`
- `notifications`
- `activity_logs`

## RLS summary

- Admin can manage all application data.
- School Head can view and review all reports.
- School User can view and update only assigned school profile data.
- School User can insert reports only for assigned school.
- School User can edit or delete reports only while pending.
- Report files inherit visibility from their parent report.
- Notifications are visible to the recipient or Admin.
- Activity logs are visible to Admin, School Head, and the actor who created the log.

## Storage

The `reports` bucket is private. Files use this path pattern:

```text
{school_id}/{report_id}/{uuid}-{filename}
```

The storage insert policy extracts `{report_id}` from the path and confirms the current user can upload to that pending report.

## Recommended production settings

- Disable public signups unless the district wants self-registration.
- Enable email confirmation.
- Use strong password requirements in Supabase Auth.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server environments.
- Review activity logs regularly.
- Rotate service keys after staff turnover.
