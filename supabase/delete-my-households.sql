delete from households
where id in (
  select hm.household_id
  from household_members hm
  join auth.users u on u.id = hm.user_id
  where u.email = 'TVOJ_EMAIL_OVDE'
);
