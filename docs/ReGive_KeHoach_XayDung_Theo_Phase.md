# ReGive — Kế hoạch xây dựng dự án theo Phase

> **Mục đích:** Tài liệu hướng dẫn triển khai ReGive theo từng giai đoạn, dùng cho team và AI coding assistant.
> **Nguồn phạm vi:** `ReGive_Proposal_AI_Implementation`, `ReGive_ChucNang_VanDe_GiaiPhap_VI`.
> **Quy tắc:** Không mở rộng tính năng ngoài proposal trừ khi team quyết định bổ sung.
> **Phiên bản:** 1.1 — 10/09/2026 (Backend đổi sang Node.js Express)

---

## 0. Tóm tắt dự án

| Hạng mục | Nội dung |
|---|---|
| Sản phẩm | ReGive — nền tảng từ thiện + marketplace second-hand có AI hỗ trợ |
| Stack | ReactJS · Node.js (Express) · MongoDB · REST · JWT · Payment Gateway · GitHub |
| Actors | User (Donor/Volunteer/Buyer), Beneficiary, Employee, Admin (+ AI component) |
| Thời gian proposal | 27/08/2026 → 06/12/2026 (Master Plan kết thúc Final Release 29/10/2026) |
| Phương pháp | Scrum · 3 sprint phát triển chính |

### Luồng sản phẩm cốt lõi

```text
Chiến dịch → Quyên góp tiền/sản phẩm / Volunteer / Beneficiary
     ↓
Tiếp nhận sản phẩm → Đánh giá (AI gợi ý + human confirm) → Kho
     ↓
Marketplace / Phân phối hỗ trợ → Đơn hàng → Thanh toán → Báo cáo
```

---

## 1. Bản đồ Phase tổng thể

| Phase | Tên | Thời gian (Master Plan) | Mục tiêu chính | Trạng thái gợi ý |
|---:|---|---|---|---|
| 0 | Initial | 27/08 – 03/09/2026 | Thu thập yêu cầu, Proposal | Đã qua / hoàn tất |
| 1 | Start-up & Foundation | 04/09 – 13/09/2026 | Kick-off, tài liệu, scaffold kỹ thuật | Đang / sắp xong |
| 2 | Sprint 1 — Core Charity | 14/09 – 27/09/2026 | Auth, campaign, donation, volunteer, beneficiary | Đang triển khai (Backend Node.js) |
| 3 | Sprint 2 — Commerce & Ops | 28/09 – 11/10/2026 | Product, warehouse, marketplace, order, payment, quản trị | Đang triển khai (Backend Node.js) |
| 4 | Sprint 3 — AI & Integration | 12/10 – 25/10/2026 | AI đánh giá SP, tích hợp E2E, test, tinh chỉnh | Backend xong (FE chưa) |
| 5 | Review & Final Release | 26/10 – 29/10/2026 | Retrospective, bàn giao, demo | Backend Final Release v1.0.0 |
| 6 | Buffer / Hardening (tuỳ chọn) | 30/10 – 06/12/2026 | Fix bug, docs, deploy ổn định nếu còn thời gian đến End Date | Dự phòng |

> **Lưu ý:** Proposal có lệch giữa End Date (06/12) và Final Release (29/10). Phase 6 dùng khoảng buffer này; không thêm feature mới trừ khi backlog còn item ưu tiên cao.

---

## 2. Module hệ thống → Phase

| # | Module | P1 | P2 (S1) | P3 (S2) | P4 (S3) |
|---:|---|:---:|:---:|:---:|:---:|
| 1 | Authentication & User/Role | Thiết kế | ✅ | Mở rộng RBAC | Hardening |
| 2 | Charity Campaign | Schema | ✅ | Admin CRUD đầy đủ | — |
| 3 | Monetary Donation | Schema | ✅ | Thanh toán donate | Báo cáo |
| 4 | Product Donation & Intake | Schema | ✅ cơ bản | Workflow đầy đủ | AI gắn intake |
| 5 | Volunteer Registration & Schedule | Schema | ✅ | Điều phối Employee | — |
| 6 | Beneficiary Support Request | Schema | ✅ | Xử lý Employee/Admin | — |
| 7 | Product Assessment & Classification | — | Stub | ✅ thủ công | ✅ + AI |
| 8 | Warehouse & Inventory | — | — | ✅ | Tinh chỉnh |
| 9 | Marketplace & Listing | — | — | ✅ | Tinh chỉnh |
| 10 | Order Management | — | — | ✅ | Tinh chỉnh |
| 11 | Payment Integration | Chọn gateway | Mock/stub | ✅ | Ổn định webhook |
| 12 | Financial Info & Reporting | — | — | Cơ bản | Dashboard |
| 13 | Notifications | Thiết kế | In-app cơ bản | Mở rộng | Hoàn thiện |
| 14 | AI Product Analysis | Chọn provider | — | Stub API | ✅ |
| 15 | Dashboards / Ops Reports | Wireframe | — | Employee/Admin cơ bản | Admin đầy đủ |

---

## 3. Phase 0 — Initial (đã hoàn thành theo lịch)

**Mục tiêu:** Chốt ý tưởng và proposal.

### Deliverables
- [x] Gathering Requirement
- [x] Proposal Document (v1.0 / v1.1)
- [x] Phạm vi actors, module, ràng buộc kỹ thuật

### Kết quả mang sang Phase 1
- Source of truth: proposal + tài liệu chức năng tiếng Việt
- Stack cố định: ReactJS / Node.js (Express) / MongoDB / JWT / REST

---

## 4. Phase 1 — Start-up & Foundation

**Thời gian:** 04/09 – 13/09/2026 (≈ 10 ngày)
**Mục tiêu:** Chuẩn bị để Sprint 1 code được ngay, không tranh cãi kiến trúc giữa chừng.

### 4.1 Công việc tài liệu / quản lý

| Task | Deliverable | Owner gợi ý |
|---|---|---|
| Kick-off | Mục tiêu, role team, Definition of Done chung | Scrum Master |
| Product Backlog | User stories theo role (User/Beneficiary/Employee/Admin) | Toàn team |
| System Context / Use Case | Sơ đồ ngữ cảnh + use case chính | Backend + BA |
| Quyết định mở (xem mục 10) | Bảng quyết định đã chốt | Toàn team |
| Repo & branching | `main` / `develop` / `feature/*`, README | DevOps/SM |
| Trello board | Backlog Sprint 1 đã estimate | SM |

### 4.2 Công việc kỹ thuật (Foundation)

| Task | Deliverable |
|---|---|
| Frontend scaffold | ReactJS + routing + layout shell (User / Beneficiary / Employee / Admin) |
| Backend scaffold | Node.js Express + package theo module + exception handler chung |
| MongoDB | Connection, naming convention collection, index cơ bản cho User |
| Auth skeleton | Register / Login / JWT issue-validate / role claim |
| API contract v0 | OpenAPI hoặc Postman collection cho Auth + Campaign |
| Environments | `.env.example`, cấu hình local FE/BE |
| CI tối thiểu (tuỳ chọn) | Build FE + BE trên GitHub Actions |

### 4.3 Definition of Done — Phase 1
- [ ] Chạy được FE + BE + MongoDB local theo README
- [ ] Login trả JWT; API protected reject được request không token
- [ ] Backlog Sprint 1 đã ưu tiên và estimate
- [ ] Đã chốt: payment gateway (hoặc sandbox), AI provider (hoặc mock trước), model role/permission cơ bản

### 4.4 Cấu trúc repo đề xuất

```text
regive/
├── frontend/          # ReactJS
├── backend/           # Node.js (Express + Mongoose)
├── docs/              # hoặc document/
│   ├── api/
│   └── plans/
└── README.md
```

---

## 5. Phase 2 — Sprint 1: Core Charity Platform

**Thời gian:** 14/09 – 27/09/2026 (14 ngày)
**Sprint Goal:** Người dùng tìm chiến dịch, quyên góp, đăng ký tình nguyện; Beneficiary gửi yêu cầu hỗ trợ; Admin/Employee quản lý tối thiểu các luồng này.

### 5.1 Backend — User Stories / Task groups

1. **Auth & Profile**
   - Đăng ký, đăng nhập, JWT, cập nhật profile
   - Role: `USER`, `BENEFICIARY`, `EMPLOYEE`, `ADMIN`
2. **Campaign**
   - Public: list + detail (mục tiêu, thời gian, địa điểm, mô tả)
   - Admin: CRUD campaign + trạng thái (draft/active/closed — chốt ở Phase 1)
3. **Donation (tiền + sản phẩm)**
   - User tạo donation tiền / donation sản phẩm gắn campaign
   - Trạng thái donation: `pending → confirmed/processing → completed/rejected` (chốt chi tiết)
   - Employee tiếp nhận donation sản phẩm (ghi nhận cơ bản)
4. **Volunteer**
   - User đăng ký volunteer theo campaign
   - Xem trạng thái đăng ký + lịch đơn giản
   - Employee/Admin duyệt / điều phối cơ bản
5. **Beneficiary**
   - Cập nhật thông tin beneficiary
   - Gửi support request, theo dõi trạng thái, xác nhận đã nhận hỗ trợ
   - Employee/Admin duyệt / cập nhật trạng thái
6. **Notification (MVP)**
   - Lưu thông báo in-app khi đổi trạng thái donation / volunteer / support request

### 5.2 Frontend — Màn hình ưu tiên

| Role | Màn hình Sprint 1 |
|---|---|
| Public/User | Login/Register, danh sách & chi tiết campaign, form donate, form volunteer, lịch sử donation/volunteer |
| Beneficiary | Hồ sơ, tạo/xem support request, xác nhận nhận hỗ trợ |
| Employee | Hàng chờ donation sản phẩm, danh sách volunteer, danh sách support request |
| Admin | Quản lý user (cơ bản), CRUD campaign, overview donation/volunteer/beneficiary |

### 5.3 Kiểm thử Sprint 1
- [ ] API test: Auth, Campaign, Donation, Volunteer, Support Request
- [ ] Happy path E2E thủ công theo từng role
- [ ] Phân quyền: Beneficiary không vào Admin; User không duyệt support request

### 5.4 Definition of Done — Sprint 1
- [ ] Demo được luồng: xem campaign → donate / volunteer → employee xử lý
- [ ] Demo được luồng: beneficiary gửi request → employee/admin duyệt → xác nhận nhận hỗ trợ
- [ ] Dữ liệu lưu MongoDB; JWT hoạt động; UI tiếng Việt cơ bản
- [ ] Không yêu cầu marketplace/payment thật / AI trong sprint này (payment donate có thể stub)

### 5.5 Gợi ý chia việc (5 người)

| Thành viên | Trọng tâm Sprint 1 |
|---|---|
| A (SM) | Backlog, tích hợp, review, Auth chung |
| B | Campaign FE + BE |
| C | Donation FE + BE |
| D | Volunteer + Beneficiary FE + BE |
| E | Employee/Admin screens + notification |

---

## 6. Phase 3 — Sprint 2: Commerce, Warehouse & Management

**Thời gian:** 28/09 – 11/10/2026 (14 ngày)
**Sprint Goal:** Sản phẩm quyên góp vào kho, lên marketplace, mua hàng và thanh toán; vận hành kho/đơn hàng/báo cáo cơ bản.

### 6.1 Backend — Task groups

1. **Product & Assessment (thủ công)**
   - Product từ donation intake
   - Phân loại, tình trạng, chất lượng, giá đề xuất (nhập tay)
   - Human review trước khi list marketplace
2. **Warehouse & Inventory**
   - Nhập kho / xuất kho / tồn kho / vị trí lưu trữ (mức tối thiểu khả thi)
   - Cập nhật stock khi bán hoặc phân phối hỗ trợ
3. **Marketplace**
   - List / detail sản phẩm second-hand đã duyệt
   - Lọc cơ bản (category, tình trạng) nếu kịp
4. **Order**
   - Tạo đơn, xem đơn, cập nhật trạng thái (`pending → paid → processing → shipped/completed / cancelled`)
5. **Payment**
   - Tích hợp payment gateway (sandbox): thanh toán đơn hàng + donation tiền
   - Callback/webhook + cập nhật trạng thái
6. **Quản trị & báo cáo**
   - Admin: products, inventory, orders, finance summary
   - Employee: xử lý order, kho, assessment
   - Notification mở rộng cho order/payment

### 6.2 Frontend — Màn hình ưu tiên

| Role | Màn hình Sprint 2 |
|---|---|
| Buyer (User) | Marketplace list/detail, giỏ/đặt hàng (nếu có cart), thanh toán, theo dõi order |
| Employee | Assessment form, inventory, order processing |
| Admin | Dashboard ops cơ bản, finance view, quản lý product/order/inventory |

### 6.3 Quy tắc nghiệp vụ bắt buộc
- Không đưa sản phẩm hỏng / không an toàn / không phù hợp lên marketplace
- Thông tin sản phẩm phải được review trước khi bán
- Payment và order phải khớp trạng thái (idempotent webhook nếu có thể)

### 6.4 Definition of Done — Sprint 2
- [x] Demo: intake sản phẩm → đánh giá thủ công → nhập kho → list marketplace → đặt hàng → thanh toán sandbox → cập nhật order *(Backend)*
- [x] Demo: Admin/Employee xem tồn kho và đơn hàng *(Backend `/api/inventory`, `/api/orders`, `/api/reports/overview`)*
- [x] Donation tiền thanh toán qua gateway (sandbox) *(Backend)*
- [x] Không còn phụ thuộc mock payment cho luồng demo chính — dùng sandbox confirm/webhook idempotent
- [ ] Frontend Sprint 2 (chưa làm)

### 6.5 Gợi ý chia việc

| Thành viên | Trọng tâm Sprint 2 |
|---|---|
| A | Payment + order state machine |
| B | Marketplace FE + BE |
| C | Warehouse/Inventory |
| D | Product assessment + listing approval |
| E | Admin dashboard / finance / reports |

---

## 7. Phase 4 — Sprint 3: AI, Integration & Hardening

**Thời gian:** 12/10 – 25/10/2026 (14 ngày)
**Sprint Goal:** AI hỗ trợ đánh giá sản phẩm với human-in-the-loop; hệ thống chạy thông suốt end-to-end; sẵn sàng demo/bàn giao.

### 7.1 AI — Phạm vi đúng proposal

AI nhận: ảnh sản phẩm + thông tin sản phẩm.
AI trả: classification, condition, quality, suggested price.

**Bắt buộc:**
1. Employee/Admin xem kết quả AI
2. Kiểm tra / chỉnh sửa
3. Xác nhận
4. Mới áp dụng vào product / listing

Không cho AI tự approve giá hoặc tự publish lên marketplace.

### 7.2 Task groups

1. **AI service integration**
   - Endpoint nội bộ: `POST /api/ai/assess-product`
   - Lưu raw AI result + status `suggested / confirmed / overridden`
   - Fallback khi AI lỗi (cho phép đánh giá thủ công)
2. **UI AI Review**
   - Màn hình Employee/Admin: side-by-side ảnh, gợi ý AI, form chỉnh sửa, nút Confirm
3. **System integration**
   - Nối đầy đủ: Campaign → Donation → Intake → AI/Manual assess → Warehouse → Marketplace → Order → Payment → Report
4. **Quality**
   - Regression test các luồng Sprint 1–2
   - Fix bug ưu tiên P0/P1
   - Bảo mật cơ bản: RBAC audit, không lộ dữ liệu beneficiary/payment
5. **Polish**
   - UI tiếng Việt, currency VND, định dạng ngày VN
   - Loading/error states, validation form
6. **Documentation**
   - README chạy hệ thống, Postman/OpenAPI cập nhật, hướng dẫn demo

### 7.3 Definition of Done — Sprint 3
- [x] Demo AI: upload ảnh → nhận gợi ý → employee chỉnh/xác nhận → product cập nhật *(Backend mock AI + human confirm)*
- [x] Demo full journey charity + marketplace trên 1 môi trường *(script `npm run demo:e2e`)*
- [x] Checklist yêu cầu AI core (assess / review / no auto-publish) đạt trên backend
- [x] Tài liệu bàn giao backend cập nhật (`backend/README.md`)
- [ ] Frontend AI Review UI (chưa làm)

---

## 8. Phase 5 — Review & Final Release

**Thời gian:** 26/10 – 29/10/2026
**Mục tiêu:** Kết thúc phát triển theo Master Plan và bàn giao.

### Công việc
- [ ] Project Retrospective Meeting (26–28/10) *(team meeting — ngoài code)*
- [x] Final testing checklist (role-based) *(backend: `npm run test:regression`)*
- [x] Chuẩn bị slide/demo script (10–15 phút) *(backend: `docs/DEMO_SCRIPT.md`)*
- [x] Đóng gói source + docs backend *(v1.0.0 + `docs/DELIVERY.md`)*
- [x] Final Release backend (29/10 target) — **API sẵn sàng bàn giao**
- [ ] Frontend + GitHub push *(tuỳ team)*

### Gói bàn giao
- [x] Source code BE (`backend/`)
- [ ] Source code FE
- [x] Tài liệu proposal / chức năng / plan phase / API (`docs/openapi.yaml`)
- [x] Tài khoản demo theo từng role
- [x] Danh sách hạn chế đã biết (`docs/KNOWN_ISSUES.md`)
- [x] RBAC matrix (`docs/RBAC.md`)

---

## 9. Phase 6 — Buffer / Hardening (tuỳ chọn đến 06/12/2026)

Chỉ làm nếu còn thời gian sau Final Release; **không phá phạm vi**.

### Ưu tiên
1. Bugfix từ demo/mentor feedback
2. Ổn định deploy (hosting, backup MongoDB, env production)
3. Cải thiện báo cáo / notification
4. Performance ảnh sản phẩm, index MongoDB
5. Test tự động bổ sung

### Không làm trong buffer (trừ khi team chốt mở rộng)
- App mobile native
- Chat realtime phức tạp
- AI tự động publish
- Multi-warehouse nâng cao / logistics 3PL đầy đủ

---

## 10. Quyết định cần chốt trước / đầu Sprint (tránh block)

| # | Chủ đề | Cần quyết định | Deadline đề xuất |
|---:|---|---|---|
| 1 | Role model | 1 account đa vai (Donor+Buyer+Volunteer) hay tách? | Trước Sprint 1 |
| 2 | Campaign lifecycle | draft / active / closed / cancelled? | Trước Sprint 1 |
| 3 | Donation statuses | Máy trạng thái chi tiết | Trước Sprint 1 |
| 4 | Payment provider | VNPay / MoMo / PayOS / Stripe sandbox… | Trước Sprint 2 |
| 5 | Image storage | Local / Cloudinary / S3-compatible | Trước Sprint 2 |
| 6 | AI provider | OpenAI Vision / Gemini / model khác / mock | Trước Sprint 3 |
| 7 | Notification channel | Chỉ in-app hay + email | Sprint 1–2 |
| 8 | Cart | Có giỏ hàng hay mua ngay 1 sản phẩm | Trước Sprint 2 |
| 9 | Shipping | Chỉ trạng thái thủ công hay có địa chỉ giao hàng đầy đủ | Trước Sprint 2 |
| 10 | Deploy target | Render/Railway/Vercel + Atlas… | Trước Sprint 3 |

---

## 11. Definition of Done chung (mọi phase)

Một item được coi là xong khi:
1. Code merge vào nhánh tích hợp
2. API/UI hoạt động đúng acceptance của story
3. Phân quyền đúng role
4. Dữ liệu nhạy cảm không lộ trái phép
5. Có cách demo được trong 2–3 phút
6. Cập nhật checklist / Postman nếu đổi contract

---

## 12. Rủi ro và cách giảm thiểu

| Rủi ro | Phase bị ảnh hưởng | Giảm thiểu |
|---|---|---|
| Payment gateway chậm duyệt | Sprint 2 | Chốt sớm; có stub + sandbox song song |
| AI API tốn phí / không ổn định | Sprint 3 | Mock + fallback thủ công; cache kết quả |
| Scope creep marketplace | Sprint 2 | Chỉ list/detail/order/payment; hoãn advanced filter |
| RBAC mơ hồ | Sprint 1 | Chốt ma trận quyền 1 trang trước khi code Admin |
| Thiếu thời gian E2E | Sprint 3 | Giữ demo script cố định từ cuối Sprint 2 |
| Lệch lịch 29/10 vs 06/12 | Phase 5–6 | Release đúng Master Plan; buffer chỉ hardening |

---

## 13. Tiêu chí chấp nhận hệ thống (Acceptance tổng)

Hệ thống ReGive đạt mức bàn giao khi demo được:

1. **User** đăng nhập, xem campaign, quyên góp tiền/sản phẩm, đăng ký volunteer, mua SP second-hand, thanh toán, xem trạng thái.
2. **Beneficiary** gửi yêu cầu hỗ trợ, theo dõi, xác nhận đã nhận.
3. **Employee** tiếp nhận donation SP, đánh giá (có AI hỗ trợ), quản lý kho, xử lý order, điều phối volunteer, xử lý support request.
4. **Admin** quản lý user/role, campaign, donation, product/inventory, volunteer/employee, beneficiary, order, tài chính/báo cáo, notification, duyệt kết quả AI.
5. **AI** chỉ gợi ý; kết quả quan trọng phải có human confirm.
6. UI phù hợp thị trường Việt Nam (tiếng Việt, VND, ngày giờ địa phương).

---

## 14. Lịch làm việc tuần (gợi ý khi vào Development)

| Ngày trong sprint | Việc chính |
|---|---|
| Day 1 | Sprint Planning + chốt story |
| Day 2–10 | Dev + daily sync |
| Day 11–12 | Integrate trong team |
| Day 13 | Test + bugfix |
| Day 14 | Sprint Review + Retro ngắn + chuẩn bị sprint sau |

---

## 15. Checklist triển khai nhanh cho AI / developer

### Bắt đầu Phase 1
- [ ] Tạo monorepo hoặc 2 repo FE/BE
- [ ] Scaffold React + Node.js (Express) + MongoDB
- [ ] JWT auth skeleton
- [ ] README chạy local

### Bắt đầu Sprint 1
- [ ] Collections: users, campaigns, donations, volunteer_registrations, support_requests, notifications
- [ ] CRUD + workflow theo DoD Sprint 1
- [ ] 4 nhóm màn hình theo role

### Bắt đầu Sprint 2
- [ ] Collections: products, inventory_transactions, orders, payments
- [ ] Payment sandbox
- [ ] Marketplace + warehouse

### Bắt đầu Sprint 3
- [ ] AI assess endpoint + review UI
- [ ] Full E2E demo script
- [ ] Docs bàn giao

---

## 16. Tài liệu liên quan

| File | Vai trò |
|---|---|
| `ReGive_Proposal_AI_Implementation (1).md` | Source of truth (EN) — phạm vi, lịch, checklist |
| `ReGive_ChucNang_VanDe_GiaiPhap_VI (1).md` | Chức năng / vấn đề / giải pháp (VI) |
| `ReGive_KeHoach_XayDung_Theo_Phase.md` | **File này** — kế hoạch xây dựng theo phase |

---

## 17. Ghi chú cho AI implementer

1. Implement đúng thứ tự Phase 1 → 2 → 3 → 4; không nhảy AI trước khi có product intake.
2. Mỗi PR/sprint chỉ hoàn thành module đã lên kế hoạch phase đó.
3. Khi proposal không chỉ rõ (schema, endpoint, gateway…), đề xuất tối giản rồi hỏi team — không tự bịa business rule lớn.
4. Luôn giữ human-in-the-loop cho AI.
5. Ưu tiên demo được end-to-end hơn UI trang trí.

---

**Kết thúc tài liệu.** Team có thể copy từng Phase thành Sprint Board (Trello) và đánh dấu checkbox khi hoàn thành.
