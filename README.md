# Social Engine — Eegyo SIMS Content Renderer

Mesin perender grafis otomatis berbasis **Node.js**, **Satori**, dan **Resvg** untuk menghasilkan gambar postingan Instagram & Facebook (format portrait feed 4:5, resolusi **1080 × 1350 px**) berdesain modern ala Canva (*Neo-Pop / Tech-Edu*).

Direktori ini dirancang khusus agar dapat dipanggil langsung oleh **AI Agent** (melalui CLI atau modul ES) menggunakan payload data JSON.

---

## 🚀 Cara Menjalankan

### 1. Eksekusi via CLI
AI Agent cukup membuat file JSON sementara (misal di folder `tmp/`) lalu mengeksekusi perintah:

```bash
node renderer.mjs <path-ke-payload.json>
```

**Contoh:**
```bash
node renderer.mjs dummy.json
```

Output gambar PNG akan otomatis dibuat di folder `output/`:
- `output/slide_1.png`
- `output/slide_2.png` (jika multi-slide carousel)
- `...`

---

### 2. Eksekusi via Kode (Programmatic)
Jika AI Agent menjalankan skrip Node.js secara langsung:

```javascript
import { renderSlide } from "./renderer.mjs";

const payload = {
  badge: "FITUR BARU",
  icon: "zap",
  title: "Otomatisasi Jadwal Pelajaran Sekolah",
  subtitle: "Kini penyusunan jadwal guru dan kelas bebas bentrok dalam satu klik.",
  items: [
    "Deteksi otomatis guru yang bentrok jam",
    "Distribusi ruangan kelas yang presisi",
    "Ekspor langsung ke format PDF dan Excel"
  ],
  brandText: "Eegyo SIMS - Aplikasi Sekolah Super Lengkap",
  website: "Kunjungi eegyosims.com"
};

// Argumen: (slideData, index, totalSlides)
const savedPath = await renderSlide(payload, 0, 1);
console.log("File PNG tersimpan di:", savedPath);
```

---

## 📋 Skema JSON Payload

AI Agent harus menyusun JSON dengan struktur berikut:

```json
{
  "slides": [
    {
      "badge": "KATEGORI / BADGE ATAS",
      "icon": "nama_ikon",
      "title": "Judul Utama Postingan",
      "subtitle": "Sub-judul atau hook penjelasan singkat.",
      "items": [
        "Poin pertama yang jelas dan padat",
        "Poin kedua berupa manfaat atau fitur",
        "Poin ketiga solusi atau hasil"
      ],
      "brandText": "Eegyo SIMS - Aplikasi Sekolah Super Lengkap",
      "website": "Kunjungi eegyosims.com"
    }
  ]
}
```

### Properti Tiap Slide

| Field | Tipe | Wajib? | Deskripsi & Rekomendasi |
|---|---|---|---|
| `title` | `string` | **Wajib** | Judul utama slide. Rekomendasi 5–10 kata. Jika terlalu panjang, judul akan otomatis membungkus (*wrap*). |
| `subtitle` | `string` | Opsional | Penjelasan atau pendukung hook judul. Rekomendasi 10–20 kata. |
| `badge` | `string` | Opsional | Teks pill di pojok kanan atas (cth: `TIPS GURU`, `FITUR BARU`, `KEAMANAN`, `UPDATE`). *Default: `INSIGHT`*. |
| `icon` | `string` | Opsional | Nama ikon SVG dari folder `assets/icons/` (tanpa ekstensi `.svg`). *Default: `check`*. |
| `items` | `string[]` | Opsional | Array poin/fitur/langkah (rekomendasi 2–4 poin, 7–15 kata per poin). |
| `brandText` | `string` | Opsional | Teks footer kiri. *Default: `Eegyo SIMS - Aplikasi Sekolah Super Lengkap`*. |
| `website` | `string` | Opsional | Teks footer kanan untuk slide terakhir/tunggal. *Default: `Kunjungi eegyosims.com`*. |

---

## 🎯 Aturan Layout & Tipe Slide Otomatis

Renderer memiliki logika adaptif otomatis tergantung ada atau tidaknya properti `items`:

### 1. Slide Berisi Poin (`items.length > 0`)
- **Cocok untuk:** Slide isi carousel, tips berurutan, fitur unggulan, checklist masalah & solusi.
- **Tampilan:**
  - Tiap item otomatis mendapatkan nomor urut (`1`, `2`, `3`) dengan font tebal di kotak kuning ber-shadow hitam.
  - Terdapat ikon checkmark di sisi kanan tiap baris.
  - Di bawah daftar item, otomatis muncul *Feature Highlight Banner* (`Otomasi & Terintegrasi • ★ RESMI & AMAN`) untuk menjaga keseimbangan visual canvas 4:5.

### 2. Slide Tanpa Poin (`items` kosong atau dihilangkan)
- **Cocok untuk:** Cover slide (halaman 1), slide penutup (CTA), slide kutipan (*quote*), atau pernyataan masalah (*problem statement*).
- **Tampilan:**
  - Ukuran judul otomatis membesar (font size 56px–64px).
  - Otomatis menampilkan *Hero Graphic Card* di bagian tengah berisi:
    - Ikon tema utama berukuran besar di badge kuning.
    - 3 sticker tags vektor (`100% Otomatis`, `Cloud Terpadu`, `Ramah Guru & Siswa`).
    - Tombol CTA: `BACA SELENGKAPNYA →`.

---

## 🎨 Daftar Ikon yang Tersedia (`assets/icons/`)

AI Agent **hanya boleh** menggunakan nama-nama ikon berikut pada properti `icon`:

| Nama Ikon | Rekomendasi Konteks Penggunaan |
|---|---|
| `academic` | Sekolah, guru, kurikulum, akreditasi, ujian, rapor, pembelajaran |
| `calendar` | Jadwal pelajaran, kalender akademik, presensi harian, agenda kegiatan |
| `clock` | Penghematan waktu, rekap absensi otomatis, deadline, real-time |
| `wallet` | Tagihan SPP, kas sekolah, pembayaran digital, laporan keuangan |
| `chart` | Statistik performa siswa, analitik sekolah, grafik perkembangan |
| `users` | Data siswa, wali murid, dewan guru, staf TU, komunitas sekolah |
| `shield` | Keamanan database, proteksi privasi siswa, cloud backup, anti-kebocoran data |
| `zap` | Otomasi cepat, fitur instan, pembuatan jadwal bebas bentrok |
| `sparkles` | Fitur AI, inovasi baru, tips pintar, highlight keunggulan |
| `cloud` | Akses online darimana saja, sinkronisasi data antar device |
| `database` | Pusat arsip digital, buku induk, rekam medis & nilai terpusat |
| `mobile` | Aplikasi wali murid, notifikasi WhatsApp/SMS, akses smartphone |
| `mail` | Pengumuman sekolah, surat edaran digital, notifikasi tagihan |
| `print` | Cetak rapor kurikulum merdeka, cetak kartu ujian, ekspor PDF/Excel |
| `bell` | Pengingat tugas, notifikasi kehadiran siswa ke orang tua |
| `check` | Verifikasi, fitur selesai, checklist keunggulan, solusi tepat |
| `target` | Target kelulusan, capaian kompetensi, strategi PPDB |
| `alert` | Masalah umum sekolah konvensional, peringatan error |
| `server` | Infrastruktur sistem, kestabilan aplikasi, uptime sekolah |
| `settings` | Pengaturan hak akses (kepala sekolah, wali kelas, admin) |

---

## 💡 Panduan Copywriting untuk AI Agent

Agar hasil desain terlihat maksimal dan seimbang:

1. **Judul Utama (`title`)**:
   - Gunakan huruf kapital di awal kata (*Title Case*).
   - Maksimal 3 baris teks pada canvas.
   - Gunakan kata kerja aktif atau angka (cth: *"5 Cara Efektif Mengatasi Jadwal Bentrok"*).
2. **Sub-judul (`subtitle`)**:
   - Gunakan 1–2 kalimat singkat (maksimal 2 baris).
   - Buat sebagai *hook* yang memancing pembaca untuk membaca slide berikutnya.
3. **Poin-poin (`items`)**:
   - Ideal: **3 item per slide** (paling estetik dan proporsional).
   - Maksimal: 4 item. Jika lebih dari 4, pecah menjadi beberapa slide carousel.
   - Awali tiap poin dengan kata kerja atau kata benda ringkas.
4. **Navigasi Carousel**:
   - Jika membuat carousel 3–5 slide, jadikan slide pertama sebagai slide tanpa `items` (Cover), slide tengah berisi `items`, dan slide terakhir berisi rangkuman atau ajakan bertindak (CTA).

---

## 📂 Contoh Payload Lengkap (Carousel 3 Slide)

Simpan ke file JSON (contoh: `tmp/post_ppdb.json`):

```json
{
  "slides": [
    {
      "badge": "PPDB 2025",
      "icon": "academic",
      "title": "Pusing Kelola Ratusan Formulir PPDB Manual?",
      "subtitle": "Tinggalkan tumpukan kertas dan antrean wali murid yang melelahkan.",
      "brandText": "Eegyo SIMS - Aplikasi Sekolah Super Lengkap",
      "website": "Geser untuk lanjut →"
    },
    {
      "badge": "SOLUSI DIGITAL",
      "icon": "zap",
      "title": "Sistem PPDB Online Otomatis & Terintegrasi",
      "subtitle": "Proses pendaftaran dari formulir hingga seleksi dalam satu dashboard.",
      "items": [
        "Pendaftaran online mandiri oleh wali murid dari HP",
        "Verifikasi berkas digital tanpa perlu arsip fisik",
        "Pembayaran formulir terhubung otomatis ke nomor VA"
      ],
      "brandText": "Eegyo SIMS - Aplikasi Sekolah Super Lengkap"
    },
    {
      "badge": "MODERNISASI",
      "icon": "sparkles",
      "title": "Siap Bawa Sekolah Anda Lebih Maju?",
      "subtitle": "Bergabunglah dengan ratusan sekolah yang sudah bertransformasi digital bersama Eegyo SIMS.",
      "brandText": "Eegyo SIMS - Aplikasi Sekolah Super Lengkap",
      "website": "Hubungi Demo di eegyosims.com"
    }
  ]
}
```

Lalu jalankan:
```bash
node renderer.mjs tmp/post_ppdb.json
```
Hasil file PNG akan langsung tersedia di folder `output/`.
