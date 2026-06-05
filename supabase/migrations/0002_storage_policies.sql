insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reports',
  'reports',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "reports bucket select visible files" on storage.objects
for select using (
  bucket_id = 'reports'
  and exists (
    select 1
    from public.report_files f
    join public.reports r on r.id = f.report_id
    where f.storage_path = storage.objects.name
      and public.report_visible(r.school_id)
  )
);

create policy "reports bucket insert pending own report" on storage.objects
for insert with check (
  bucket_id = 'reports'
  and exists (
    select 1
    from public.reports r
    where r.id = public.storage_report_id(storage.objects.name)
      and (
        public.is_admin()
        or (r.school_id = public.current_school_id() and r.submitted_by = auth.uid() and r.status = 'pending')
      )
  )
);

create policy "reports bucket delete pending own report" on storage.objects
for delete using (
  bucket_id = 'reports'
  and exists (
    select 1
    from public.reports r
    where r.id = public.storage_report_id(storage.objects.name)
      and (
        public.is_admin()
        or (r.school_id = public.current_school_id() and r.submitted_by = auth.uid() and r.status = 'pending')
      )
  )
);
