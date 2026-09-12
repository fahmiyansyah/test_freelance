# Full Bright Indonesia — Trial Landing Page

Landing page TOEFL berdasarkan https://toefl.fullbrightindonesia.org/c10-lp, dipasang ke PBM Laravel + Inertia + React boilerplate. Halaman utama berada di `resources/js/pages/demo/ctwa.tsx`; aset publik berada di `public/assets`, `public/lms`, dan `public/logo`.

## Alur aplikasi

- `PROJECT_MODE=ctwa`, `PAYMENT_MODE=none`.
- `/` menampilkan landing page. Pengunjung memilih paket belajar mandiri atau tutor.
- CTA WhatsApp dan checkout eksternal memakai `TrackedCTA`; section penting memiliki ID stabil.
- Tracking internal tetap menggunakan endpoint dan dashboard bawaan Laravel.
- Checkout dan LMS member merupakan situs eksternal; aplikasi ini tidak memproses pembayaran.
- `/login` dan `/admin` digunakan untuk dashboard analytics.

## Menjalankan lokal

Kebutuhan: PHP 8.3+, Composer 2, Node.js 22.13+, npm. SQLite cukup untuk pengembangan lokal; gunakan MySQL/MariaDB sesuai panduan boilerplate untuk production.

```bash
composer install
npm ci
cp .env.example .env
php artisan key:generate
```

Pilih database lokal. Untuk SQLite, buat `database/database.sqlite`, lalu ubah `.env`:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=/path/absolut/project/database/database.sqlite
PROJECT_MODE=ctwa
PAYMENT_MODE=none
```

Untuk MySQL, buat database kosong dan isi `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, serta `DB_PASSWORD` sesuai `.env.example`.

```bash
php artisan migrate
php artisan pbm:create-admin
composer dev
```

Buka http://localhost:8000. Untuk menjalankan hasil build tanpa Vite development server:

```bash
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Build mengambil font dashboard dari Bunny Fonts sehingga memerlukan internet pada build pertama. Tipografi landing page mengikuti fallback font yang digunakan halaman referensi, tanpa menambahkan font Nunito yang akan mengubah ukuran teks.

## Verifikasi

```bash
composer test
npm run lint:check
npm run format:check
npm run types:check
npm run build
```

Pengujian browser memerlukan Chrome dan Laravel lokal pada port 8000:

```bash
npm run test:browser
```

Pengujian memeriksa desktop dan mobile: render, overflow, gambar hero, pergantian paket, FAQ, lightbox, tracking WhatsApp/checkout, serta login admin. Tujuan WhatsApp dan checkout diintersep saat tes sehingga tidak membuka layanan klien.

Untuk menjalankan tes login, sediakan `.local-admin.json` berisi `email` dan `password` akun admin **database lokal**. File tersebut, `.env`, dan database SQLite diabaikan Git. Tes login dilewati jika file credential lokal tidak ada. Jangan memakai credential production untuk pengujian ini.

`node scripts/compare-pages.mjs` mengambil screenshot serta ukuran elemen referensi dan lokal pada viewport 1440 × 900 dan 390 × 900. Output berada di `qa/` dan diabaikan Git. Screenshot mencakup elemen dinamis seperti countdown, animasi, dan video sehingga tidak cocok dijadikan perbandingan piksel tanpa normalisasi.

## Deployment

Deploy sebagai satu aplikasi Laravel beserta database, bukan hanya folder hasil build React. Ikuti [panduan deployment boilerplate](docs/09-deployment.md).

1. Siapkan PHP, extension Laravel, MySQL/MariaDB, domain, dan HTTPS.
2. Isi `.env` server: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, database, `CLIENT_ID`, mode CTWA, dan nomor WhatsApp.
3. Jalankan `composer install --no-dev --optimize-autoloader` serta `npm ci && npm run build`.
4. Jalankan `php artisan key:generate` hanya pada instalasi pertama, `php artisan migrate --force`, `php artisan storage:link`, dan `php artisan optimize`.
5. Arahkan document root web server ke `public/`; pastikan `storage` dan `bootstrap/cache` dapat ditulis.
6. Buat admin production sendiri dan pasang cron `php artisan schedule:run` setiap menit.
7. Uji halaman, login dashboard, dan event CTA sebelum mengirim link hasil trial.

Integrasi Meta, GA4, GTM, Clarity, dan Duitku tetap opsional. Jangan menyalin ID tracking atau credential dari website referensi.

## Aset eksternal

Logo utama, logo universitas yang tersedia, screenshot LMS, dan avatar review sudah disimpan lokal. Video demo LMS masih memakai CDN yang sama dengan referensi. Logo Unpad pada referensi memakai URL eksternal yang tidak selalu tersedia. Countdown, carousel, dan popup bergantung pada waktu serta aktivitas sesi.
