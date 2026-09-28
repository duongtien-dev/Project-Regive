# Known Issues — ReGive Backend v1.0.0

| # | Hạng mục | Mô tả | Mức | Ghi chú |
|---:|---|---|---|---|
| 1 | Payment | Dùng **sandbox** nội bộ, chưa tích hợp VNPay/MoMo thật | Expected | Đủ cho demo Sprint 2–3 |
| 2 | AI | Provider mặc định là **mock heuristic**, chưa gọi Vision API thật | Expected | Hook `AI_PROVIDER` sẵn |
| 3 | Upload ảnh | Chỉ nhận URL string trong `images[]`, chưa có upload file/storage | Limitation | Sprint buffer nếu cần |
| 4 | Cart | Mua ngay 1 sản phẩm / đơn, chưa có giỏ hàng nhiều SP | By design | Theo quyết định Sprint 2 |
| 5 | Notification | Chỉ in-app, chưa email/SMS | By design | |
| 6 | Mongo txn | Không dùng multi-doc transaction (tương thích Mongo standalone) | Limitation | Payment dùng claim idempotent |
| 7 | Frontend | Chưa có UI React trong gói bàn giao backend | Out of scope BE | Phase FE riêng |
| 8 | Deploy | Chưa cấu hình hosting/CI production mặc định | Pending | Phase 6 buffer |
| 9 | Rate limit | Auth limit có thể chặn nếu spam login khi demo | Note | Tăng `AUTH_RATE_LIMIT_MAX` nếu cần |
| 10 | Password reset | Chưa có quên mật khẩu / verify email | Limitation | Không nằm Sprint 1–3 |

Không coi các mục Expected/By design là bug trừ khi mentor yêu cầu mở rộng.
