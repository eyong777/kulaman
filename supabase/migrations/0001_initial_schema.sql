create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'school_head', 'school_user');
create type public.report_status as enum ('pending', 'approved', 'rejected');

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  school_id text not null unique,
  name text not null,
  district text,
  address text,
  head_name text,
  contact_email text,
  contact_phone text,
  enrollment_count integer check (enrollment_count is null or enrollment_count >= 0),
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'school_user',
  school_id uuid references public.schools(id) on delete set null,
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  category_id uuid not null references public.report_categories(id),
  submitted_by uuid not null references public.users(id),
  title text not null,
  description text,
  reporting_period text,
  status public.report_status not null default 'pending',
  reviewer_id uuid references public.users(id),
  reviewed_at timestamptz,
  review_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 26214400),
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.users(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index schools_district_idx on public.schools(district);
create index users_role_idx on public.users(role);
create index users_school_id_idx on public.users(school_id);
create index reports_school_id_idx on public.reports(school_id);
create index reports_status_idx on public.reports(status);
create index reports_category_id_idx on public.reports(category_id);
create index reports_created_at_idx on public.reports(created_at desc);
create index report_files_report_id_idx on public.report_files(report_id);
create index notifications_recipient_id_idx on public.notifications(recipient_id, is_read);
create index activity_logs_created_at_idx on public.activity_logs(created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_schools_updated_at before update on public.schools
for each row execute function public.touch_updated_at();

create trigger touch_users_updated_at before update on public.users
for each row execute function public.touch_updated_at();

create trigger touch_report_categories_updated_at before update on public.report_categories
for each row execute function public.touch_updated_at();

create trigger touch_reports_updated_at before update on public.reports
for each row execute function public.touch_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid() and is_active = true;
$$;

create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.users where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.can_review_reports()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin', 'school_head');
$$;

create or replace function public.report_visible(report_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_review_reports() or report_school_id = public.current_school_id();
$$;

create or replace function public.storage_report_id(path text)
returns uuid
language plpgsql
stable
as $$
begin
  return split_part(path, '/', 2)::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.prevent_school_user_review_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.user_role;
begin
  actor_role := public.current_user_role();

  if actor_role = 'school_user' then
    if old.status <> 'pending' then
      raise exception 'Approved or rejected reports cannot be edited by school users.';
    end if;

    if new.status <> old.status
       or new.reviewer_id is distinct from old.reviewer_id
       or new.reviewed_at is distinct from old.reviewed_at
       or new.review_remarks is distinct from old.review_remarks then
      raise exception 'School users cannot change review fields.';
    end if;
  end if;

  return new;
end;
$$;

create trigger prevent_school_user_review_mutation before update on public.reports
for each row execute function public.prevent_school_user_review_mutation();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role, school_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'school_user'),
    nullif(new.raw_user_meta_data->>'school_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.prevent_user_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    if new.role is distinct from old.role
       or new.school_id is distinct from old.school_id
       or new.is_active is distinct from old.is_active
       or new.email is distinct from old.email then
      raise exception 'Users cannot modify their own role, school assignment, status, or email.';
    end if;
  end if;
  return new;
end;
$$;

create trigger prevent_user_privilege_escalation before update on public.users
for each row execute function public.prevent_user_privilege_escalation();

alter table public.schools enable row level security;
alter table public.users enable row level security;
alter table public.report_categories enable row level security;
alter table public.reports enable row level security;
alter table public.report_files enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "users select own admin or school head" on public.users
for select using (id = auth.uid() or public.current_user_role() in ('admin', 'school_head'));

create policy "admins insert users" on public.users
for insert with check (public.is_admin());

create policy "admins update users" on public.users
for update using (public.is_admin() or id = auth.uid())
with check (public.is_admin() or id = auth.uid());

create policy "admins delete users" on public.users
for delete using (public.is_admin());

create policy "schools select by role" on public.schools
for select using (public.can_review_reports() or id = public.current_school_id());

create policy "admins insert schools" on public.schools
for insert with check (public.is_admin());

create policy "schools update by role" on public.schools
for update using (public.is_admin() or id = public.current_school_id())
with check (public.is_admin() or id = public.current_school_id());

create policy "admins delete schools" on public.schools
for delete using (public.is_admin());

create policy "categories select active" on public.report_categories
for select using (is_active = true or public.is_admin());

create policy "admins manage categories" on public.report_categories
for all using (public.is_admin()) with check (public.is_admin());

create policy "reports select visible" on public.reports
for select using (public.report_visible(school_id));

create policy "reports insert own school" on public.reports
for insert with check (
  public.is_admin()
  or (school_id = public.current_school_id() and submitted_by = auth.uid() and status = 'pending')
);

create policy "reports update by role" on public.reports
for update using (
  public.can_review_reports()
  or (school_id = public.current_school_id() and submitted_by = auth.uid() and status = 'pending')
) with check (
  public.can_review_reports()
  or (school_id = public.current_school_id() and submitted_by = auth.uid() and status = 'pending')
);

create policy "reports delete by role" on public.reports
for delete using (
  public.is_admin()
  or (school_id = public.current_school_id() and submitted_by = auth.uid() and status = 'pending')
);

create policy "files select visible reports" on public.report_files
for select using (
  exists (
    select 1 from public.reports r
    where r.id = report_id and public.report_visible(r.school_id)
  )
);

create policy "files insert pending own report" on public.report_files
for insert with check (
  exists (
    select 1 from public.reports r
    where r.id = report_id
      and (public.is_admin() or (r.school_id = public.current_school_id() and r.submitted_by = auth.uid() and r.status = 'pending'))
  )
);

create policy "files delete pending own report" on public.report_files
for delete using (
  exists (
    select 1 from public.reports r
    where r.id = report_id
      and (public.is_admin() or (r.school_id = public.current_school_id() and r.submitted_by = auth.uid() and r.status = 'pending'))
  )
);

create policy "notifications select own or admin" on public.notifications
for select using (recipient_id = auth.uid() or public.is_admin());

create policy "reviewers insert notifications" on public.notifications
for insert with check (public.can_review_reports());

create policy "notifications update own or admin" on public.notifications
for update using (recipient_id = auth.uid() or public.is_admin())
with check (recipient_id = auth.uid() or public.is_admin());

create policy "activity select permitted" on public.activity_logs
for select using (public.can_review_reports() or actor_id = auth.uid());

create policy "activity insert authenticated" on public.activity_logs
for insert with check (auth.uid() is not null and (actor_id = auth.uid() or actor_id is null));

insert into public.report_categories (name, description)
values
  ('Monthly Accomplishment Report', 'Recurring school accomplishment and compliance updates.'),
  ('School Governance Report', 'Governance, committee, and school improvement documentation.'),
  ('Enrollment Report', 'Enrollment counts, movement, and learner information reports.'),
  ('Financial Liquidation', 'Liquidation and financial compliance submissions.'),
  ('Learning Recovery Report', 'Learning recovery plans, progress, and outcomes.'),
  ('Facilities and Maintenance', 'Facilities, repairs, and maintenance status reports.'),
  ('Incident Report', 'Incident and urgent school situation reports.'),
  ('Other Compliance Report', 'Other reports requested by district or division leadership.')
on conflict (name) do nothing;
