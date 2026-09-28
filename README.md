# ReGive — Capstone 2

Nền tảng từ thiện + marketplace second-hand (AI hỗ trợ, human-in-the-loop).

## Stack

- Backend: Node.js + Express + MongoDB + JWT (`backend/`)
- User + Employee web: Next.js + Tailwind (`web/`) — `http://localhost:3000`
- Admin web: React + Vite + Tailwind (`admin/`) — Admin & Employee, `http://localhost:5173`

## Chạy local

```bash
# 1. API
cd backend
cp .env.example .env
npm install
npm run seed
npm start
```

```bash
# 2. User / Employee (http://localhost:3000)
cd web
npm install
npm run dev
```

```bash
# 3. Admin (http://localhost:5173)
cd admin
npm install
npm run dev
```

Next.js rewrite `/api` → `http://localhost:5000`. Vite proxy `/api` → backend. CORS mặc định cho origin `http://localhost:5173` (admin).

## Tài khoản demo

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@regive.local | Admin@123 |
| EMPLOYEE | employee@regive.local | Employee@123 |
| USER | user@regive.local | User@123 |
| BENEFICIARY | beneficiary@regive.local | Beneficiary@123 |

USER / EMPLOYEE dùng `web/` (`http://localhost:3000`). ADMIN dùng `admin/` (`http://localhost:5173`).

## Tài liệu

- `document/ReGive_KeHoach_XayDung_Theo_Phase.md`
- `backend/README.md` · `backend/docs/RBAC.md` · `backend/docs/openapi.yaml`
- `admin/README.md`
"# Project-Regive" 
