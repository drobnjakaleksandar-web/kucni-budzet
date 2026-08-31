-- ====================================
-- KUCNI BUDZET - Pocetna sema baze
-- ====================================

-- 1. Domacinstva (zajednicki "prostor" za dve osobe)
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Naše domaćinstvo',
  created_at timestamptz not null default now()
);

-- 2. Clanovi domacinstva (povezuje Supabase korisnike sa domacinstvom)
create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

-- 3. Transakcije (prilivi i odlivi)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  type text not null check (type in ('priliv', 'odliv')),
  category text not null,
  title text not null,
  amount numeric not null check (amount > 0),
  occurred_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

-- 4. Stedne korpe
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now()
);

-- 5. Dugovi
create table debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  direction text not null check (direction in ('duguju', 'duguju_nam')),
  total_amount numeric not null check (total_amount > 0),
  paid_amount numeric not null default 0,
  next_due_date date,
  linked_to_expenses boolean not null default false,
  created_at timestamptz not null default now()
);

-- ====================================
-- Row Level Security (RLS)
-- Svako vidi SAMO podatke svog domacinstva
-- ====================================

alter table households enable row level security;
alter table household_members enable row level security;
alter table transactions enable row level security;
alter table savings_goals enable row level security;
alter table debts enable row level security;

-- Pomocna funkcija: da li je trenutni korisnik clan datog domacinstva
create or replace function is_household_member(hh_id uuid)
returns boolean as $$
  select exists (
    select 1 from household_members
    where household_id = hh_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

create policy "Clanovi vide svoje domacinstvo"
  on households for select
  using (is_household_member(id));

create policy "Clanovi vide clanove svog domacinstva"
  on household_members for select
  using (is_household_member(household_id));

create policy "Korisnik moze da se doda kao clan"
  on household_members for insert
  with check (user_id = auth.uid());

create policy "Clanovi upravljaju transakcijama domacinstva"
  on transactions for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "Clanovi upravljaju stednim korpama"
  on savings_goals for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "Clanovi upravljaju dugovima"
  on debts for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
