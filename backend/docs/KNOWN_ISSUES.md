# Known Issues — ReGive Backend v1.0.0

| # | Hạng mục | Mô tả | Mức | Ghi chú |
|---:|---|---|---|---|
| 1 | Payment | Dùng **sandbox** nội bộ, chưa tích hợp VNPay/MoMo thật | Expected | Đủ cho demo Sprint 2–3 |
| 2 | AI | Provider mặc định là **Gemini**, fallback heuristic khi lỗi | Done | Hook `AI_PROVIDER=gemini` sẵn, cần `GEMINI_API_KEY` |
| 3 | Upload ảnh | Đã hỗ trợ **upload file** qua multer (local storage) | Done | `POST /api/uploads/single`, `POST /api/uploads/multiple` |
| 4 | Cart | Mua ngay 1 sản phẩm / đơn, chưa có giỏ hàng nhiều SP | By design | Theo quyết định Sprint 2 |
| 5 | Notification | In-app + **email** (SMTP) | Done | Cần cấu hình `SMTP_USER`, `SMTP_PASS` |
| 6 | Mongo txn | Không dùng multi-doc transaction (tương thích Mongo standalone) | Limitation | Payment dùng claim idempotent |
| 7 | Frontend | Đã có UI React (regive-user + admin) | Done | Phase FE hoàn tất |
| 8 | Deploy | Chưa cấu hình hosting/CI production mặc định | Pending | Phase 6 buffer |
| 9 | Rate limit | Auth limit có thể chặn nếu spam login khi demo | Note | Tăng `AUTH_RATE_LIMIT_MAX` nếu cần |
| 10 | Password reset | **Đã hỗ trợ** forgot-password / reset-password qua email | Done | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| 11 | Email verification | **Đã hỗ trợ** xác thực email khi đăng ký | Done | `POST /api/auth/verify-email`, `POST /api/auth/resend-verification` |

Không coi các mục Expected/By design là bug trừ khi mentor yêu cầu mở rộng.
