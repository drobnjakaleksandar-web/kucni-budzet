-- Dodaj kolonu koja pamti ko je napravio domacinstvo
alter table households add column created_by uuid references auth.users(id) default auth.uid();

-- Zameni staro pravilo novim koje dozvoljava i tvorcu da vidi domacinstvo odmah
drop policy "Clanovi vide svoje domacinstvo" on households;

create policy "Clanovi ili tvorac vide domacinstvo"
  on households for select
  using (is_household_member(id) or created_by = auth.uid());
