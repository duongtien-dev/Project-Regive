# ReGive Admin

Web quản trị (Admin + Employee) — React + Vite + Tailwind. Gọi REST API backend đã bàn giao.

## Chạy local

Backend phải chạy trước (`http://localhost:5000`). Vite proxy `/api` → backend.

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm start
```

```bash
cd admin
npm install
npm run dev
```

Mở `http://localhost:5173`.

## Tài khoản

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@regive.local | Admin@123 |
| EMPLOYEE | employee@regive.local | Employee@123 |

USER / BENEFICIARY không vào được admin.

## Màn hình

- Tổng quan (`GET /api/reports/overview`)
- Chiến dịch CRUD (Admin)
- Quyên góp + intake sản phẩm
- Tình nguyện, yêu cầu hỗ trợ
- Sản phẩm / đánh giá / publish
- Kho nhập-xuất-điều chỉnh
- Đơn hàng, thanh toán
- AI review human-in-the-loop (không auto-publish)
- Người dùng (Admin)
- Thông báo in-app

Tuỳ chọn: tạo `admin/.env` với `VITE_API_URL=http://localhost:5000` nếu không dùng proxy.
