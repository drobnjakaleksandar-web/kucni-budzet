select hm.household_id, h.name, h.created_at,
       (select count(*) from transactions t where t.household_id = hm.household_id) as broj_transakcija,
       (select count(*) from savings_goals sg where sg.household_id = hm.household_id) as broj_stednih_korpi
from household_members hm
join households h on h.id = hm.household_id
join auth.users u on u.id = hm.user_id
where u.email = 'TVOJ_EMAIL_OVDE'
order by h.created_at;
