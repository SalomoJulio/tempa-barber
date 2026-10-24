-- Jalankan SETELAH 01-database.sql, melalui Supabase SQL Editor.
-- Seluruh data uji di-ROLLBACK; data pelanggan tidak dibaca/dicetak.
begin;
set local search_path = public, extensions, pg_catalog;

do $$
declare
  v_barber uuid;
  v_service uuid;
  v_first uuid;
  v_start timestamptz := date_trunc('day', now()) + interval '365 days 10 hours';
begin
  if (select count(*) from public.services) <> 3 then
    raise exception 'FAIL: jumlah layanan awal bukan 3';
  end if;
  if (select count(*) from public.working_hours) <> 6 then
    raise exception 'FAIL: jadwal contoh tidak lengkap';
  end if;
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in
      ('services','barbers','working_hours','barber_time_off','bookings','admin_users')
      and not c.relrowsecurity
  ) then
    raise exception 'FAIL: ada tabel tanpa RLS';
  end if;
  select id into strict v_barber from public.barbers where slug = 'arga';
  select id into strict v_service from public.services where slug = 'signature-cut';

  insert into public.bookings
    (customer_name,customer_phone,service_id,barber_id,starts_at,ends_at,price_idr)
    values ('UJI SEMENTARA','6281234567890',v_service,v_barber,v_start,v_start + interval '45 minutes',80000)
    returning id into v_first;

  begin
    insert into public.bookings
      (customer_name,customer_phone,service_id,barber_id,starts_at,ends_at,price_idr)
      values ('UJI BENTROK','6281234567890',v_service,v_barber,v_start + interval '30 minutes',v_start + interval '75 minutes',80000);
    raise exception 'FAIL: booking bertabrakan diterima';
  exception when exclusion_violation then
    null;
  end;

  -- Booking tepat setelah layanan pertama selesai harus diterima.
  insert into public.bookings
    (customer_name,customer_phone,service_id,barber_id,starts_at,ends_at,price_idr)
    values ('UJI BERURUTAN','6281234567890',v_service,v_barber,v_start + interval '45 minutes',v_start + interval '90 minutes',80000);

  update public.bookings set status = 'cancelled' where id = v_first;
  insert into public.bookings
    (customer_name,customer_phone,service_id,barber_id,starts_at,ends_at,price_idr)
    values ('UJI SLOT BATAL','6281234567890',v_service,v_barber,v_start,v_start + interval '45 minutes',80000);

  raise notice 'PASS: RLS, data awal, overlap, slot berurutan, pembatalan';
end $$;

set local role anon;
do $$
begin
  if (select count(*) from public.services) <> 3 then
    raise exception 'FAIL: layanan publik tidak terbaca';
  end if;
  begin
    perform 1 from public.bookings limit 1;
    raise exception 'FAIL: publik dapat membaca booking';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.admin_users(user_id) values (gen_random_uuid());
    raise exception 'FAIL: publik dapat menambah admin';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS: akses publik dibatasi';
end $$;
reset role;

set local role authenticated;
do $$
begin
  begin
    perform 1 from public.bookings limit 1;
    raise exception 'FAIL: pengguna biasa dapat membaca booking';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.services set price_idr = 0;
    raise exception 'FAIL: pengguna biasa dapat mengubah harga';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS: login biasa tidak memberikan akses admin';
end $$;
reset role;
rollback;
select 'PASS — seluruh pemeriksaan selesai; data uji dibatalkan.' as result;
