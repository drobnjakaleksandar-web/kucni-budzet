# Kućni Budžet

Next.js + Tailwind CSS aplikacija za praćenje kućnih finansija, napravljena prema Figma dizajnu.

## Pokretanje lokalno

```bash
npm install
npm run dev
```

Otvori http://localhost:3000

## Deployment na Vercel

1. Napravi novi repozitorijum na GitHubu i push-uj ovaj kod
2. Idi na vercel.com -> Add New Project -> poveži GitHub repo
3. Vercel automatski prepoznaje Next.js, samo klikni Deploy

## Sledeći koraci (baza podataka)

Trenutno aplikacija koristi mock podatke iz `lib/mock-data.ts`.
Sledeći korak je povezivanje sa Supabase (PostgreSQL + Auth):

1. Napravi projekat na supabase.com
2. Instaliraj `@supabase/supabase-js`
3. Napravi tabele: `transactions`, `savings_goals`, `debts`, `households`
4. Zameni mock podatke pravim upitima ka Supabase bazi
5. Dodaj pravu autentifikaciju (email/password ili magic link)
