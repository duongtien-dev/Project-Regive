# ReGive Backend — Final Delivery (Phase 5)

**Version:** 1.0.0  
**Stack:** Node.js · Express · MongoDB · JWT · Mock AI  
**Ngày:** 10/09/2026

## Phạm vi đã bàn giao (Backend)

| Sprint | Nội dung | Trạng thái |
|---|---|---|
| 1 | Auth, Campaign, Donation, Volunteer, Beneficiary, Notification | Done |
| 2 | Product, Inventory, Marketplace, Order, Payment sandbox, Reports | Done |
| 3 | AI assess + human-in-the-loop, E2E demo | Done |
| 5 | Hardening, OpenAPI, regression, delivery docs | Done |

## Chạy nhanh

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm start
```

Kiểm tra:

```bash
npm run demo:e2e
npm run test:regression
```

## Tài khoản demo

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@regive.local | Admin@123 |
| EMPLOYEE | employee@regive.local | Employee@123 |
| USER | user@regive.local | User@123 |
| BENEFICIARY | beneficiary@regive.local | Beneficiary@123 |

## Tài liệu kèm theo

| File | Mục đích |
|---|---|
| `README.md` | Hướng dẫn API & chạy local |
| `docs/openapi.yaml` | OpenAPI 3 contract (tóm tắt) |
| `docs/RBAC.md` | Ma trận phân quyền |
| `docs/KNOWN_ISSUES.md` | Hạn chế đã biết |
| `docs/DEMO_SCRIPT.md` | Script demo mentor ~10 phút |
| `../document/ReGive_*.md` | Proposal / chức năng / plan phase |

## Endpoints hệ thống

- `GET /api/health` — liveness + version/phase
- `GET /api/ready` — readiness (MongoDB)

## Ghi chú bảo mật Final Release

- Helmet security headers
- Rate limit API chung + siết auth login/register
- Ẩn `sandboxToken` / `rawCallback` khỏi list payment
- Cảnh báo / chặn JWT_SECRET yếu khi production
