-- ═══════════════════════════════════════════════════════
-- MACRO FIRE — Supabase Database Schema
-- Ejecuta este SQL en: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- ─── Habilitar UUID ──────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABLA: profiles ─────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  name          text,
  height        numeric,
  age           integer,
  sex           text default 'male',
  activity      text default 'moderado',
  goal          text default 'Mantenimiento',
  start_weight  numeric,
  target_weight numeric,
  start_date    date,
  restrictions  text,
  conditions    text,
  meals_per_day integer default 4,
  updated_at    timestamptz default now()
);

-- ─── TABLA: goals ────────────────────────────────────────
create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade unique not null,
  target_cal  integer,
  prot        integer,
  carbs       integer,
  fat         integer,
  cal_fixed   integer default 0,
  tdee        integer,
  bmr         integer,
  water       integer,
  dist        text,
  note        text,
  prot_range  text,
  carb_range  text,
  fat_range   text,
  updated_at  timestamptz default now()
);

-- ─── TABLA: meals ────────────────────────────────────────
create table if not exists meals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null default current_date,
  name        text not null,
  grams       numeric,
  cal         numeric,
  prot        numeric,
  carbs       numeric,
  fat         numeric,
  fiber       numeric default 0,
  meal_type   text default 'Almuerzo',
  created_at  timestamptz default now()
);

create index if not exists meals_user_date_idx on meals(user_id, date);

-- ─── TABLA: weight_log ───────────────────────────────────
create table if not exists weight_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  weight      numeric not null,
  note        text,
  date        text,
  created_at  timestamptz default now()
);

create index if not exists weight_log_user_idx on weight_log(user_id, created_at desc);

-- ─── TABLA: nutrition_plans ──────────────────────────────
create table if not exists nutrition_plans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  plan_data   jsonb,
  context     jsonb,
  created_at  timestamptz default now()
);

create index if not exists nutrition_plans_user_idx on nutrition_plans(user_id, created_at desc);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Cada usuario solo ve sus datos
-- ═══════════════════════════════════════════════════════

alter table profiles        enable row level security;
alter table goals           enable row level security;
alter table meals           enable row level security;
alter table weight_log      enable row level security;
alter table nutrition_plans enable row level security;

-- Profiles
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Goals
create policy "Users manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Meals
create policy "Users manage own meals"
  on meals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Weight log
create policy "Users manage own weight"
  on weight_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Nutrition plans
create policy "Users manage own plans"
  on nutrition_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- Función: crear perfil automáticamente al registrarse
-- ═══════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
