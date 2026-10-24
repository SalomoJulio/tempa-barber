-- TEMPA / tahap 1. Jalankan SEKALI di SQL Editor proyek Supabase BARU.
-- Semua perubahan dalam satu transaksi; tidak menghapus tabel lama.
begin;

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
set local search_path = public, extensions, pg_catalog;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (length(btrim(name)) between 1 and 100),
  price_idr integer not null check (price_idr >= 0),
  duration_minutes integer not null check (duration_minutes between 5 and 240),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (length(btrim(name)) between 1 and 100),
  bio text not null default '',
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id),
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  unique (barber_id, weekday),
  check (opens_at < closes_at)
);
comment on table public.working_hours is
  'Jam lokal Asia/Jakarta. weekday: 0=Minggu, 1=Senin, ... 6=Sabtu. Satu rentang per hari untuk versi pertama.';

create table public.barber_time_off (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  check (ends_at > starts_at)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code uuid not null unique default gen_random_uuid(),
  customer_name text not null check (length(btrim(customer_name)) between 1 and 60),
  customer_phone text not null check (customer_phone ~ '^62[0-9]{8,13}$'),
  service_id uuid not null references public.services(id),
  barber_id uuid not null references public.barbers(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_idr integer not null check (price_idr >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint bookings_no_overlap exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'completed', 'no_show'))
);
comment on table public.bookings is
  'Data privat. Harga dan ends_at harus dihitung server dari layanan; kode booking bukan bukti otorisasi. Pending menahan slot sampai dikonfirmasi atau dibatalkan admin.';

create index bookings_service_idx on public.bookings(service_id);
create index bookings_start_idx on public.bookings(starts_at);
create index time_off_barber_start_idx on public.barber_time_off(barber_id, starts_at);

-- Daftar admin dikelola operator database, bukan pengguna yang mendaftar.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.barbers enable row level security;
alter table public.working_hours enable row level security;
alter table public.barber_time_off enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

-- Hapus grant bawaan hanya untuk tabel TEMPA yang baru dibuat.
revoke all on public.services, public.barbers, public.working_hours,
  public.barber_time_off, public.bookings, public.admin_users
  from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.services, public.barbers to anon, authenticated;
create policy services_public_read on public.services
  for select to anon, authenticated using (active = true);
create policy barbers_public_read on public.barbers
  for select to anon, authenticated using (active = true);

-- Server saja. Tidak ada policy publik untuk nama/telepon pelanggan,
-- jadwal privat, daftar admin, ataupun penulisan booking.
grant select, insert, update, delete on public.services, public.barbers,
  public.working_hours, public.barber_time_off, public.bookings,
  public.admin_users to service_role;

-- Data contoh mengikuti tampilan TEMPA. Harga/durasi masih bisa direvisi.
insert into public.services (slug, name, price_idr, duration_minutes) values
  ('essential-cut', 'Essential Cut', 50000, 30),
  ('signature-cut', 'Signature Cut', 80000, 45),
  ('complete-grooming', 'Complete Grooming', 110000, 60);

insert into public.barbers (slug, name, bio, image_path) values
  ('arga', 'Arga', 'Profil barber fiktif untuk portofolio TEMPA.', '/images/arga-barber.png');

-- Contoh: Senin-Sabtu 10:00-17:00 WIB; Minggu tutup.
insert into public.working_hours (barber_id, weekday, opens_at, closes_at)
select b.id, d.day::smallint, time '10:00', time '17:00'
from public.barbers b cross join generate_series(1, 6) as d(day)
where b.slug = 'arga';

commit;
