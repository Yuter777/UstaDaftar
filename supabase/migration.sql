-- ============================================================
--  Usta Daftar — to'liq CRM uchun migratsiya
--  Supabase → SQL Editor → bu faylni to'liq nusxalab "Run"
--  Mavjud jadvallarni o'chirmaydi, faqat yetishmayotganini qo'shadi.
-- ============================================================

-- ---------- BRIGADALAR (yangi) ----------
create table if not exists brigadalar (
  id uuid primary key default gen_random_uuid(),
  usta_id uuid references ustalar(id) on delete cascade,
  nom text not null,
  mutaxassislik text,
  rang text default '#3B82F6',
  created_at timestamptz default now()
);

-- ---------- ISHCHILAR (mavjud — ustun qo'shamiz) ----------
-- Ilova ishchini brigadaga bog'laydi va kunlik haq bilan ishlaydi
alter table ishchilar add column if not exists brigada_id uuid references brigadalar(id) on delete cascade;
alter table ishchilar add column if not exists kunlik_haq numeric default 0;

-- ---------- OBYEKTLAR (yangi — voronka) ----------
create table if not exists obyektlar (
  id uuid primary key default gen_random_uuid(),
  usta_id uuid references ustalar(id) on delete cascade,
  brigada_id uuid references brigadalar(id) on delete set null,
  mijoz_ism text not null,
  manzil text,
  telefon text,
  status text default 'zamer' check (status in ('zamer','tasdiq','ishda','tugadi')),
  boshlanish date,
  tugash date,
  smeta_summa numeric default 0,
  tolangan numeric default 0,
  created_at timestamptz default now()
);

-- ---------- SMETA (yangi) ----------
create table if not exists smeta (
  id uuid primary key default gen_random_uuid(),
  obyekt_id uuid references obyektlar(id) on delete cascade,
  turi text check (turi in ('ish','material','xarajat')),
  nom text not null,
  birlik text,
  miqdor numeric,
  narx numeric,
  created_at timestamptz default now()
);

-- ---------- KATALOG (yangi) ----------
create table if not exists katalog (
  id uuid primary key default gen_random_uuid(),
  usta_id uuid references ustalar(id) on delete cascade,
  turi text check (turi in ('ish','material','xarajat')),
  nom text not null,
  birlik text,
  narx numeric,
  created_at timestamptz default now()
);

-- ---------- TOLOVLAR (yangi — ishchiga avans/oylik) ----------
-- Eslatma: sizdagi "avanslar" jadvali tegilmaydi. Ilova "tolovlar" dan foydalanadi.
create table if not exists tolovlar (
  id uuid primary key default gen_random_uuid(),
  ishchi_id uuid references ishchilar(id) on delete cascade,
  summa numeric not null,
  sana date default current_date,
  turi text default 'avans',
  izoh text,
  created_at timestamptz default now()
);

-- ---------- DAVOMAT: holat 'yarim' qiymatiga ruxsat ----------
alter table davomat drop constraint if exists davomat_holat_check;
alter table davomat add constraint davomat_holat_check
  check (holat in ('keldi','kelmadi','yarim','yarim kun'));

-- ============================================================
--  RLS — kirgan (authenticated) foydalanuvchiga to'liq ruxsat
--  (Ilova login talab qiladi; anon kalit bilan kirmagan o'qiy olmaydi)
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'ustalar','brigadalar','ishchilar','obyektlar','smeta',
    'katalog','davomat','tolovlar','avanslar','bozorlik'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth_all" on %I', t);
    execute format(
      'create policy "auth_all" on %I for all to authenticated using (true) with check (true)', t
    );
  end loop;
end $$;
