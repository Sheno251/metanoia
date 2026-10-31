-- ============================================
-- METANOIA – Supabase Schema
-- شغّل الكود ده في SQL Editor على Supabase
-- ============================================

-- جدول الأشخاص
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date,
  phone text,
  notes text,
  last_confession date,
  followed_up boolean not null default false,
  followed_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- جدول الاعترافات (سجل تاريخي)
create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  confession_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

-- فهارس للسرعة
create index if not exists idx_people_name on public.people (name);
create index if not exists idx_people_last_confession on public.people (last_confession);
create index if not exists idx_confessions_person on public.confessions (person_id);
create index if not exists idx_confessions_date on public.confessions (confession_date);

-- تحديث updated_at تلقائي
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_people_updated_at on public.people;
create trigger trg_people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

-- ============================================
-- Row Level Security
-- (كل الوصول لازم يكون بعد تسجيل دخول الأب)
-- ============================================
alter table public.people enable row level security;
alter table public.confessions enable row level security;

-- سياسات: أي مستخدم مسجل دخول يقدر يقرأ/يكتب
drop policy if exists "authenticated read people" on public.people;
create policy "authenticated read people"
  on public.people for select
  to authenticated using (true);

drop policy if exists "authenticated insert people" on public.people;
create policy "authenticated insert people"
  on public.people for insert
  to authenticated with check (true);

drop policy if exists "authenticated update people" on public.people;
create policy "authenticated update people"
  on public.people for update
  to authenticated using (true);

drop policy if exists "authenticated delete people" on public.people;
create policy "authenticated delete people"
  on public.people for delete
  to authenticated using (true);

drop policy if exists "authenticated read confessions" on public.confessions;
create policy "authenticated read confessions"
  on public.confessions for select
  to authenticated using (true);

drop policy if exists "authenticated insert confessions" on public.confessions;
create policy "authenticated insert confessions"
  on public.confessions for insert
  to authenticated with check (true);

drop policy if exists "authenticated update confessions" on public.confessions;
create policy "authenticated update confessions"
  on public.confessions for update
  to authenticated using (true);

drop policy if exists "authenticated delete confessions" on public.confessions;
create policy "authenticated delete confessions"
  on public.confessions for delete
  to authenticated using (true);