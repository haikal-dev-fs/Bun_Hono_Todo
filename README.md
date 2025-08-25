# Bun + Hono Todo API

> A tiny, fast Todo API built with Bun and Hono — made for learning and experimenting.

Why this repo?
- Lightweight starter to learn Bun (runtime) + Hono (web framework).
- Uses Prisma for simple data modeling and PostgreSQL for storage (configurable).
- Ready-to-run examples and helpful README to get you coding fast.

Features
- List todos, get single todo, create, update, delete.
- Prisma schema + generated client included.

Quick start

1. Install dependencies (using bun):

# Bun + Hono Todo API

Selamat datang di repo belajar Bun + Hono — sebuah API Todo kecil, cepat, dan ringkas yang cocok untuk eksperimen dan demo.

Repo: https://github.com/haikal-dev-fs/Bun_Hono_Todo

Kenapa pakai ini?
- Ringan dan cepat: Bun sebagai runtime, Hono sebagai framework minimal.
- Praktis: Prisma untuk model data, bisa gunakan Postgres atau SQLite untuk testing.
- Edukatif: fokus ke konsep server, routing, dan ORM.

Fitur
- CRUD sederhana untuk Todo (list, lihat, buat, ubah, hapus).

Mulai cepat

1) Install dependency:

```powershell
bun install
```

2) (Opsional) Siapkan database di `prisma/schema.prisma`. Untuk percobaan cepat, ganti provider ke `sqlite` dan pakai file lokal.

3) Generate Prisma client dan jalankan migrasi:

```powershell
bunx prisma generate
bunx prisma migrate dev --name init
```

4) Jalankan server (dev):

```powershell
bun run dev
```

Buka http://localhost:3000

Endpoint contoh
- GET /todos — daftar semua todo
- GET /todo/:id — lihat todo
- POST /todo — buat { "title": "Tulis tugas" }
- PUT /todo/:id — update { "title": "Baru", "completed": true }
- DELETE /todo/:id — hapus

Contoh curl (quick test):

```powershell
curl -X POST http://localhost:3000/todo -H "Content-Type: application/json" -d "{\"title\":\"Belajar Bun\"}"
curl http://localhost:3000/todos
```

Kontribusi

Silakan fork, buat branch, dan kirim PR. Cocok untuk latihan dan workshop.

Lisensi

MIT — bebas dipakai, dimodifikasi, dan dibagikan.
