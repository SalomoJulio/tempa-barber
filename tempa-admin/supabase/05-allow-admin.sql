-- GANTI email contoh dengan email akun yang SUDAH dibuat di Supabase Authentication.
-- Tidak memasukkan password. Jalankan setelah mengganti email.
do $$
declare v_user uuid;
begin
  select id into v_user from auth.users
    where lower(email) = lower('GANTI_EMAIL_ADMIN_DI_SINI');
  if v_user is null then
    raise exception 'Akun belum ditemukan. Buat user di Authentication dan ganti email pada SQL ini.';
  end if;
  insert into public.admin_users(user_id) values(v_user)
    on conflict(user_id) do nothing;
end $$;
