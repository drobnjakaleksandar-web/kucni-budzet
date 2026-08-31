select user_id, count(*) as broj_domacinstava
from household_members
group by user_id;
