-- Jalankan sekali setelah database TEMPA tahap 1 dan create_booking tersedia.
begin;
create table public.admin_login_limits (
  bucket_key text not null,
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (bucket_key, window_start)
);
create index admin_login_limits_window_idx on public.admin_login_limits(window_start);
alter table public.admin_login_limits enable row level security;
revoke all on public.admin_login_limits from public, anon, authenticated;
grant select, insert, update, delete on public.admin_login_limits to service_role;

create function public.consume_admin_login_limit(p_key text)
returns boolean language plpgsql security invoker
set search_path = pg_catalog, public as $$
declare v_window timestamptz; v_limit integer; v_hits integer;
begin
  if p_key = 'global' then v_limit := 50;
  elsif p_key ~ '^email:[0-9a-f]{64}$' then v_limit := 5;
  else raise exception 'INVALID_RATE_KEY'; end if;
  v_window := date_bin(interval '10 minutes', clock_timestamp(), timestamptz '2020-01-01 00:00:00+00');
  delete from public.admin_login_limits where window_start < v_window - interval '1 day';
  insert into public.admin_login_limits(bucket_key, window_start, hits)
  values(p_key, v_window, 1)
  on conflict (bucket_key, window_start) do update
    set hits = least(public.admin_login_limits.hits + 1, v_limit + 1)
  returning hits into v_hits;
  return v_hits <= v_limit;
end $$;
revoke execute on function public.consume_admin_login_limit(text) from public, anon, authenticated;
grant execute on function public.consume_admin_login_limit(text) to service_role;

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  actor_id uuid not null references auth.users(id),
  from_status text not null,
  to_status text not null,
  changed_at timestamptz not null default now()
);
create index booking_status_history_booking_idx on public.booking_status_history(booking_id);
alter table public.booking_status_history enable row level security;
revoke all on public.booking_status_history from public, anon, authenticated;
grant select, insert on public.booking_status_history to service_role;

create function public.admin_change_booking_status(
  p_actor_id uuid, p_booking_id uuid, p_status text
)
returns void language plpgsql security invoker
set search_path = pg_catalog, public as $$
declare v_barber uuid; v_booking public.bookings%rowtype;
begin
  perform 1 from public.admin_users where user_id = p_actor_id for share;
  if not found then raise exception 'ADMIN_REQUIRED'; end if;

  select barber_id into v_barber from public.bookings where id = p_booking_id;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;

  -- Urutan kunci sama dengan create_booking.
  perform 1 from public.barbers where id = v_barber for update;
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if v_booking.status = p_status then return; end if;

  if not (
    (v_booking.status = 'pending' and p_status in ('confirmed','cancelled'))
    or (v_booking.status = 'confirmed' and p_status in ('completed','no_show','cancelled'))
  ) or p_status is null then
    raise exception 'INVALID_STATUS_TRANSITION';
  end if;

  if p_status in ('completed','no_show') and clock_timestamp() < v_booking.ends_at then
    raise exception 'VISIT_NOT_FINISHED';
  end if;

  update public.bookings set status = p_status where id = p_booking_id;
  insert into public.booking_status_history(booking_id,actor_id,from_status,to_status)
    values(p_booking_id,p_actor_id,v_booking.status,p_status);
end $$;
revoke execute on function public.admin_change_booking_status(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.admin_change_booking_status(uuid,uuid,text) to service_role;
commit;
