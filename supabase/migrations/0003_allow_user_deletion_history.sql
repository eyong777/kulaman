alter table public.reports
  drop constraint if exists reports_submitted_by_fkey,
  drop constraint if exists reports_reviewer_id_fkey;

alter table public.reports
  alter column submitted_by drop not null;

alter table public.reports
  add constraint reports_submitted_by_fkey
  foreign key (submitted_by)
  references public.users(id)
  on delete set null,
  add constraint reports_reviewer_id_fkey
  foreign key (reviewer_id)
  references public.users(id)
  on delete set null;
