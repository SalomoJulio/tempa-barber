# TEMPA — database tahap 1

Paket ini menambahkan fondasi PostgreSQL untuk Supabase. Tidak mengganti file website. Belum membuat database cloud, menghubungkan form, atau menyediakan dashboard admin.

## Langkah pemasangan

1. Buka https://supabase.com/dashboard dan buat akun atau masuk.
2. Buat proyek BARU bernama `tempa-barber`. Pilih region dekat pengguna Indonesia yang tersedia. Periksa paket dan biaya yang ditampilkan sebelum membuat proyek.
3. Buat password database yang kuat, simpan di password manager, dan jangan kirim password atau secret key ke chat. Aktifkan MFA untuk akun pengelola bila tersedia.
4. Tunggu database siap. Buka SQL Editor > New query.
5. Buka `01-database.sql` di VS Code, salin SELURUH isinya, tempel ke SQL Editor, lalu Run. Jalankan sekali pada proyek baru/kosong. Jika gagal, simpan pesan error; jangan menghapus tabel atau menonaktifkan RLS untuk mengatasinya. Transaksi mencegah pemasangan setengah jadi.
6. Di query terpisah, jalankan SELURUH `02-checks.sql`. Hasil akhir yang diharapkan: `PASS — seluruh pemeriksaan selesai; data uji dibatalkan.`
7. Lihat Table Editor: services (3), barbers (1), working_hours (6), barber_time_off (0), bookings (0), admin_users (0).
8. Kirim hasil sukses atau pesan error tanpa kredensial. Tahap berikutnya adalah koneksi server Next.js dan form booking.

## Keputusan awal

- Harga: Essential 50.000/30 menit, Signature 80.000/45 menit, Complete 110.000/60 menit.
- Arga adalah profil fiktif. Gambar tetap disimpan di public/images, bukan di database.
- Jam CONTOH: Senin-Sabtu 10:00-17:00 WIB, Minggu tutup. Konfirmasi jadwal sebelum mengaktifkan booking sungguhan.
- Waktu booking menggunakan timestamptz; aplikasi harus mengonversi pilihan WIB secara eksplisit dengan zona Asia/Jakarta. Zona jam laptop pengguna tidak menentukan jam toko.
- Booking pending menahan slot; admin perlu mengonfirmasi atau membatalkannya. Expiry otomatis belum dibuat.
- Booking dibatalkan tidak lagi menahan slot. Slot yang tepat dimulai saat booking sebelumnya selesai boleh diterima.
- Kode booking acak bukan password atau izin untuk membaca nama/nomor telepon.

## Hak akses

Hanya layanan dan barber aktif yang dapat dibaca publik. Tidak ada izin browser untuk membaca/menulis booking, membaca jam kerja privat, atau menambah admin. Pengguna yang berhasil login belum otomatis menjadi admin.

Service role mempunyai akses tinggi dan hanya boleh digunakan di server. Kunci ini melewati RLS; server WAJIB memvalidasi input dan otorisasi setiap operasi. Jangan gunakan prefix NEXT_PUBLIC untuk secret key. Jangan menaruh secret di Git atau screenshot.

## Yang belum disediakan

Database ini belum siap menerima reservasi publik sampai server dibuat dan diuji. Server harus menghitung harga dan waktu selesai dari database, memeriksa layanan/barber aktif, jam buka, cuti, waktu lampau, dan konflik. Daftar slot hanya perkiraan; pengecekan akhir terjadi saat penyimpanan. Exclusion constraint menjadi perlindungan terakhir terhadap bentrok antar-booking, termasuk permintaan bersamaan. Konflik cuti terhadap booking memerlukan penguncian/transaksi bersama di tahap server.

Tahap selanjutnya: endpoint booking dengan transaksi, rate limit persisten, anti-bot, ketersediaan tanpa data pelanggan, koneksi form, Supabase Auth untuk admin, pemeriksaan allowlist admin di server, pencatatan perubahan, backup dan uji pemulihan sesuai paket, retensi data pelanggan, serta pengujian akses dan konkurensi. Belum ada pengiriman WhatsApp.

## Validasi paket

Disertakan pengujian SQL untuk data awal, RLS, penolakan jadwal bertabrakan, slot berurutan, pembatalan, akses publik, dan pengguna login biasa. Pengujian dijalankan pada transaksi dengan ROLLBACK sehingga tidak meninggalkan data uji. Perlu dijalankan di Supabase milikmu; paket ini tidak menyatakan database cloud sudah dibuat atau diuji di akunmu.

## Referensi resmi

- https://supabase.com/docs/guides/database/tables
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/database/secure-data
- https://www.postgresql.org/docs/current/rangetypes.html
