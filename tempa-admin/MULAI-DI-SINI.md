# TEMPA — login dan dashboard admin

Paket tambahan untuk proyek TEMPA yang sudah memiliki database, `@supabase/supabase-js`, `server-only`, dan `src/lib/supabase/admin.ts` dengan fungsi `createAdminClient`.

## Isi

- `/admin/login`: login email/password dengan identitas visual TEMPA.
- `/admin`: statistik seluruh booking, filter status, daftar kunjungan, pagination 20 per halaman, data pelanggan dan layanan.
- Konfirmasi, pembatalan, selesai, dan tidak hadir dengan konfirmasi sebelum perubahan.
- Audit perubahan status di `booking_status_history`.
- Pemeriksaan token melalui Supabase Auth dan allowlist `admin_users` di SERVER, termasuk setiap perubahan status.
- Pembatas login persisten: 5 per email dan 50 keseluruhan setiap bucket 10 menit; email di penghitung berbentuk HMAC.

## 1. Tambahkan file

Ekstrak ZIP. Salin folder `src` DARI DALAM paket ke folder utama `tempa-barber` milikmu (sejajar package.json), lalu gabungkan foldernya.

Hasil: `tempa-barber/src/app/admin/page.tsx`, `tempa-barber/src/app/admin/login/page.tsx`, dan seterusnya.

Tidak perlu mengubah `page.tsx` beranda, Hero, About, Services, Barbers, Gallery, Booking, globals.css, package.json, atau file API. Paket tidak memuat `.env.local`. Jika Windows meminta mengganti file admin yang pernah dibuat sendiri, backup file tersebut terlebih dahulu. Tidak ada dependency tambahan.

## 2. Database

Jalankan seluruh `supabase/04-admin.sql` pada query BARU di Supabase SQL Editor. Jalankan sekali. Transaksi tidak menghapus booking yang sudah ada.

## 3. Buat akun admin

Di Supabase, buka Authentication > Users, cari Add user > Create new user (label dapat berbeda). Buat user dengan email milikmu dan password yang kuat. Konfirmasi email melalui mekanisme yang tersedia; jika membuat user manual ada opsi Auto Confirm User, aktifkan untuk akunmu sendiri. Jangan mengirim password atau screenshot kredensial.

Setelah akun ada, buka `supabase/05-allow-admin.sql`. Ganti `GANTI_EMAIL_ADMIN_DI_SINI` dengan email akun tadi. Jalankan di SQL Editor. Akun yang hanya dibuat di Authentication belum otomatis menjadi admin.

Untuk versi ini, pendaftaran publik tidak digunakan. Nonaktifkan pendaftaran pengguna baru jika tidak diperlukan. Jangan menambahkan user lain ke `admin_users` kecuali memang pengelola yang berwenang.

## 4. Periksa izin

Jalankan `supabase/06-check-admin.sql`. Pada hasil pertama, tiap tiga kolom harus `false, false, true`. Pada hasil kedua, jumlah_admin minimal 1.

## 5. Konfigurasi lokal

Gunakan `.env.local` yang SUDAH ADA:

```env
SUPABASE_URL=nilai_yang_sudah_ada
SUPABASE_SECRET_KEY=secret_baru_yang_sudah_ada
APP_ORIGIN=http://localhost:3000
```

Jangan menyalin placeholder di atas untuk menggantikan nilai yang bekerja. Jangan menggunakan `NEXT_PUBLIC_` untuk secret. Jika kunci lama pernah terlihat pada screenshot, pastikan sudah direvoke dan diganti.

Simpan semua file, hentikan server dengan Ctrl+C, lalu `npm run dev`. Buka http://localhost:3000/admin/login. Pakai localhost:3000 sesuai APP_ORIGIN, bukan IP jaringan/port lain. Jangan menambahkan export runtime/dynamic pada file halaman atau route karena proyek menggunakan Cache Components.

## 6. Pengujian satu per satu

1. Buka /admin di jendela incognito: harus menuju login, bukan menampilkan data.
2. Password salah: pesan generik, tidak ada data booking.
3. Akun login yang TIDAK ada di admin_users: ditolak.
4. Akun admin benar: dashboard menampilkan booking yang sudah dibuat.
5. Coba filter Menunggu dan Dikonfirmasi.
6. Konfirmasi satu booking uji: status berubah dan tercatat di booking_status_history. Slot tetap tertutup.
7. Batalkan booking uji: status berubah menjadi cancelled. Pilih tanggal/layanan yang sama pada landing page dan tekan Periksa ulang jadwal; slot terbuka kembali. Pembatalan adalah status akhir pada versi ini.
8. Selesai/Tidak hadir hanya dapat diberikan pada booking confirmed setelah waktu berakhir (diperiksa database).
9. Klik Keluar lalu kunjungi /admin lagi: harus menuju login. Jangan membagikan screenshot nama/telepon pelanggan tanpa menutupinya.

## Perilaku sesi dan batas versi

Sesi memakai access token di cookie HttpOnly, SameSite=Strict, Secure pada production. Tidak ada token di localStorage atau JavaScript browser. Tidak menyimpan refresh token; sesi berakhir maksimal satu jam atau sesuai expiry token bila lebih pendek, kemudian perlu login kembali. Keluar menghapus cookie di browser ini; token yang sudah diterbitkan tetap mengikuti masa berlakunya. Untuk mencabut hak akses segera, hapus membership admin_users di Supabase, yang dicek ulang pada setiap request server. Riwayat browser yang sudah termuat sebelumnya bukan bukti masih punya akses; periksa dengan request/muat ulang.

Statistik menghitung SELURUH data, bukan hanya hari ini. Tidak menghitung pendapatan karena harga booking bukan bukti pembayaran. Daftar ditampilkan dari tanggal kunjungan terbaru, 20 per halaman sampai 500 halaman; untuk arsip lebih besar tambahkan filter tanggal/cursor. Dashboard belum realtime; Muat ulang untuk melihat booking baru. Harga pada data lama berasal dari snapshot saat booking, nama layanan/barber dari tabel saat ini.

SQL status mengunci barber seperti create_booking. Perubahan jam kerja/cuti belum disediakan; jika dibuat nanti, gunakan protokol kunci barber yang sama dan validasi booking yang sudah ada. Tidak menyediakan pengaktifan ulang cancelled sehingga tidak mengambil slot yang sudah dipesan orang lain.

Belum termasuk MFA admin, lupa password, refresh session, perlindungan bot/IP hosting, backup/restore, retensi pelanggan, dan produksi. Sebelum publish: atur APP_ORIGIN HTTPS yang benar, uji izin dan login pada deployment, tambahkan pengamanan bot/IP, dan pastikan kredensial tidak masuk Git. `noindex` hanya mengurangi pengindeksan, bukan pengaman akses.

## Referensi

- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://supabase.com/docs/guides/database/functions
- https://nextjs.org/docs/app/api-reference/functions/cookies

Paket perlu diuji pada proyek Supabase dan Next.js milikmu; pembuatan akun dan pemasangan cloud tidak dilakukan otomatis.

## Pemeriksaan sebelum dikirim

Build Next.js 16.4.2 pada proyek validasi terpisah dengan cacheComponents dan partialPrefetching berhasil. TypeScript dan lint diperiksa. Sintaks SQL dan PL/pgSQL diperiksa dengan parser PostgreSQL. Tes fungsi tampilan mencakup transisi tombol, status akhir, format Rupiah, dan konversi UTC ke WIB lintas tengah malam. Ini bukan pengujian login/cloud end-to-end; jalankan checklist di atas pada proyek milikmu.
