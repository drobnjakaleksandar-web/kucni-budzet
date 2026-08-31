-- Fiksni/ponavljajuci troskovi (Netflix, struja, telefon...)
create table recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  category text not null default 'Fiksni',
  default_amount numeric not null check (default_amount > 0),
  due_day int check (due_day between 1 and 31),
  is_variable boolean not null default false,
  created_at timestamptz not null default now()
);

-- Evidencija placanja po mesecima (period = 'YYYY-MM')
create table recurring_payments (
  id uuid primary key default gen_random_uuid(),
  recurring_expense_id uuid not null references recurring_expenses(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  transaction_id uuid references transactions(id) on delete set null,
  amount numeric not null,
  period text not null,
  paid_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (recurring_expense_id, period)
);

alter table recurring_expenses enable row level security;
alter table recurring_payments enable row level security;

create policy "Clanovi upravljaju fiksnim troskovima"
  on recurring_expenses for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "Clanovi upravljaju placanjima fiksnih troskova"
  on recurring_payments for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
