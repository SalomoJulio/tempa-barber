-- Pemeriksaan read-only. Hasil yang diharapkan: false, false, true untuk kedua fungsi.
select
  has_function_privilege('anon','public.admin_change_booking_status(uuid,uuid,text)','execute') as public_status_access,
  has_function_privilege('authenticated','public.admin_change_booking_status(uuid,uuid,text)','execute') as user_status_access,
  has_function_privilege('service_role','public.admin_change_booking_status(uuid,uuid,text)','execute') as server_status_access,
  has_function_privilege('anon','public.consume_admin_login_limit(text)','execute') as public_login_limit_access,
  has_function_privilege('authenticated','public.consume_admin_login_limit(text)','execute') as user_login_limit_access,
  has_function_privilege('service_role','public.consume_admin_login_limit(text)','execute') as server_login_limit_access;

select count(*) as jumlah_admin from public.admin_users;
