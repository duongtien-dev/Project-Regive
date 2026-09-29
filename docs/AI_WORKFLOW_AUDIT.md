# ReGive AI Workflow Audit

Ngay kiem tra: 2026-09-29

Pham vi da doc:
- `docs/`
- `backend/`
- `regive-user/`

## 1. Ket luan nhanh

AI cua du an da duoc trien khai mot phan va co the demo duoc, nhung hien tai la AI mock/heuristic, chua phai tich hop model AI/Vision ben ngoai.

Trang thai theo tung lop:

| Hang muc | Trang thai | Ghi chu |
|---|---|---|
| Yeu cau nghiep vu AI trong proposal | Co | AI phan loai san pham, danh gia condition/quality, goi y gia; bat buoc human review. |
| Backend AI core | Da trien khai | Co service heuristic, model `AiAssessment`, API assess/confirm/reject/pending. |
| Human-in-the-loop tren backend | Da trien khai | AI chi tao suggestion; Employee/Admin confirm/override moi apply vao `Product`. |
| Auto publish len marketplace | Khong co | Dung yeu cau: AI khong tu publish; can goi route publish rieng. |
| Frontend `regive-user` | Da trien khai preview cho User | User co nut "Tham dinh cung AI" o form donate product; day la preview, khong luu `AiAssessment`. |
| Frontend review UI cho Employee/Admin trong `regive-user` | Chua co | `regive-user` la user-facing app, khong co man hinh staff review AI. |
| External AI provider | Da co Gemini option | Set `AI_PROVIDER=gemini` + `GEMINI_API_KEY`; mac dinh van `mock` cho local/demo. |
| OpenAPI backend | Co nhung chua day du | Co `/ai/assess-product` va confirm, thieu preview/pending/reject/list-by-product detail. |

## 2. Workflow AI theo tai lieu goc

Nguon tai lieu:
- `docs/ReGive_Proposal_AI_Implementation (1).md`
- `docs/ReGive_KeHoach_XayDung_Theo_Phase.md`
- `docs/USER_WEBSITE_PLAN.md`

Yeu cau cot loi:
1. AI nhan anh san pham va thong tin san pham.
2. AI tra ve:
   - classification/category;
   - condition;
   - quality;
   - suggested price.
3. Ket qua AI khong co quyen quyet dinh cuoi cung.
4. Admin hoac Employee phai review/confirm/override truoc khi ap dung vao san pham.
5. AI khong duoc tu approve gia va khong duoc tu publish len marketplace.

Tai lieu phase ghi ro Sprint 3 can:
- `POST /api/ai/assess-product`
- luu raw AI result voi status `suggested / confirmed / overridden`
- fallback khi AI loi
- UI Employee/Admin de xem AI suggestion va confirm
- khong cho AI tu publish

## 3. Backend workflow hien tai

### 3.1 Route mount

Backend mount AI routes tai:

```js
app.use('/api/ai', aiRoutes);
```

File: `backend/src/app.js`

### 3.2 API dang co

File: `backend/src/routes/aiRoutes.js`

| Method | Endpoint | Auth | Muc dich |
|---|---|---|---|
| POST | `/api/ai/preview-donation` | Public | User preview AI khi dien form quyengop hien vat. Khong luu DB. |
| POST | `/api/ai/assess-product` | ADMIN/EMPLOYEE | Tao AI assessment cho product da intake. |
| GET | `/api/ai/pending` | ADMIN/EMPLOYEE | Lay danh sach assessment dang `suggested`. |
| GET | `/api/ai/products/:productId` | ADMIN/EMPLOYEE | Lay lich su AI assessment cua mot product. |
| GET | `/api/ai/assessments/:id` | ADMIN/EMPLOYEE | Xem chi tiet mot assessment. |
| POST | `/api/ai/assessments/:id/confirm` | ADMIN/EMPLOYEE | Confirm/override AI suggestion va apply vao product. |
| POST | `/api/ai/assessments/:id/reject` | ADMIN/EMPLOYEE | Reject suggestion, product khong doi. |

### 3.3 AI provider thuc te

File: `backend/src/services/aiService.js`

Hien tai AI la rule-based mock:
- detect category bang keyword trong `name`, `description`, `category`, `extraNote`, `images`;
- detect condition bang keyword nhu `new`, `damaged`, `broken`, `fair`, `poor`;
- derive quality tu condition;
- tinh suggested price bang bang gia co dinh va he so condition/quality;
- tinh them impact metrics: meals, notebooks, waste diverted, CO2 saved.

Config co:
- `AI_PROVIDER`
- `AI_API_KEY`

Hien tai backend ho tro `AI_PROVIDER=gemini`. Khi co `GEMINI_API_KEY`, service goi Gemini REST `generateContent` voi structured JSON output. Neu Gemini loi hoac thieu key, backend fallback ve heuristic va ghi provider `gemini-fallback`.

### 3.4 Du lieu luu DB

File: `backend/src/models/AiAssessment.js`

Collection `AiAssessment` luu:
- `product`
- `requestedBy`
- `status`: `suggested`, `confirmed`, `overridden`, `rejected`, `failed`
- `provider`
- `input`
- `suggestion`
- `finalDecision`
- `rawResponse`
- `errorMessage`
- `reviewedBy`
- `reviewedAt`
- `appliedToProduct`

File `backend/src/models/Product.js` co lien ket:
- `latestAiAssessment`
- `condition`
- `quality`
- `suggestedPrice`
- `price`
- `suitableForMarketplace`
- `reviewed`
- `reviewedBy`
- `reviewedAt`
- `assessmentNote`

### 3.5 Luong staff/Admin dung AI

1. Product donation duoc intake thanh `Product`.
   - API: `POST /api/products/intake`
   - Product ban dau status `draft`.

2. Employee/Admin goi AI assessment.
   - API: `POST /api/ai/assess-product`
   - Input: `productId`, optional `images`, `extraNote`.
   - Backend lay product, build input, goi `assessProductInput`.
   - Tao document `AiAssessment` status `suggested`.
   - Gan `product.latestAiAssessment`.
   - Them note `[AI:<assessmentId>] pending human review`.
   - Chua apply condition/price vao product.

3. Employee/Admin review.
   - API: `POST /api/ai/assessments/:id/confirm`
   - Co the confirm y nguyen hoac override:
     - `category`
     - `condition`
     - `quality`
     - `suggestedPrice`
     - `price`
     - `suitableForMarketplace`
     - `assessmentNote`
     - `applyPrice`

4. Backend apply sau khi human confirm.
   - Neu final decision khac suggestion: status `overridden`.
   - Neu giong suggestion: status `confirmed`.
   - Product duoc cap nhat category/condition/quality/suggestedPrice/suitableForMarketplace.
   - Product `reviewed=true`.
   - Product status thanh `assessed` neu hop le.
   - Neu condition nam trong unsafe conditions (`damaged`): product status `rejected`, `listedOnMarketplace=false`.

5. Publish marketplace la buoc rieng.
   - API: `POST /api/products/:id/publish`
   - AI confirm khong tu publish.

## 4. Frontend `regive-user` workflow hien tai

### 4.1 Service

File: `regive-user/src/services/aiService.ts`

Frontend chi co mot ham:

```ts
previewDonation(payload) -> POST /ai/preview-donation
```

Ham nay tra ve `AiDonationPreview`.

### 4.2 User-facing AI preview

File: `regive-user/src/app/campaigns/[id]/donate-product/page.tsx`

Workflow:
1. User vao `/campaigns/:id/donate-product`.
2. User nhap ten vat pham.
3. Bam nut "Tham dinh cung AI".
4. Frontend goi:

```ts
aiService.previewDonation({
  name,
  description,
  category,
  images: imageUrl ? [imageUrl] : [],
  extraNote: conditionNote,
})
```

5. UI hien thi:
   - confidence;
   - condition;
   - quality;
   - suggested price;
   - impact metrics.

6. User co the bam "Ap dung thong so nay".
   - Frontend copy suggestion vao form:
     - `category`
     - `estimatedValue`
     - `conditionNote`

7. Khi submit donation:
   - Goi donation API tao `Donation` type `product`.
   - AI preview khong duoc luu thanh `AiAssessment`.
   - AI preview chi tro giup user dien form, khong phai review chinh thuc.

### 4.3 Hien thi marketplace

Frontend `regive-user` co doc `latestAiAssessment` trong type `Product`.
Marketplace detail/list co the hien thi suggestion neu backend populate `latestAiAssessment`.

Tuy nhien `regive-user` khong co UI Employee/Admin de confirm/reject AI assessment.

## 5. Da trien khai den dau?

### Da co

- Backend AI service mock/heuristic.
- Backend endpoint preview cho user.
- Backend endpoint assess product cho staff.
- Backend luu `AiAssessment`.
- Backend human review confirm/override/reject.
- Backend apply ket qua vao product sau human review.
- Backend chan auto publish.
- Backend reject product unsafe/damaged.
- Frontend user donate-product co AI preview va apply suggestion vao form.
- Demo script backend co luong AI trong `backend/src/scripts/demo-e2e.js`.

### Chua co / can bo sung neu muon dat dung proposal day du o UI

- Da co external AI provider Gemini qua REST API, nhung mac dinh `.env.example` van de `AI_PROVIDER=mock`.
- Chua co prompt/model versioning.
- Chua co image upload/vision analysis that; `images` hien la URL/string metadata, mock chi dung text.
- Chua co frontend Employee/Admin AI Review UI trong `regive-user`.
- Chua co trang quan tri de:
  - list pending AI assessments;
  - xem side-by-side anh + suggestion;
  - confirm/override/reject;
  - publish product sau khi review.
- `backend/docs/openapi.yaml` chua cap nhat day du cac route AI.
- Criteria condition/quality/price dang la heuristic don gian, chua co scoring rubric duoc product team chot.

## 6. Checklist kiem tra backend AI

Can backend dang chay o `http://localhost:5000/api` va MongoDB co seed/demo data.

### 6.1 Kiem tra health/config

```bash
curl http://localhost:5000/api/health
```

Ky vong:
- response co `aiProvider`;
- neu `.env` mac dinh thi `aiProvider=mock`.

### 6.2 Kiem tra preview public

```bash
curl -X POST http://localhost:5000/api/ai/preview-donation \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ao khoac con tot\",\"description\":\"Ao am da giat sach\",\"category\":\"clothing\",\"images\":[],\"extraNote\":\"con tot\"}"
```

Ky vong:
- HTTP 200;
- co `data.assessment.condition`;
- co `data.assessment.quality`;
- co `data.assessment.suggestedPrice`;
- co `data.impactMetrics`.

### 6.3 Kiem tra staff assess product

1. Login employee/admin de lay token.

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"employee@regive.local\",\"password\":\"Password123!\"}"
```

2. Tao/intake product tu donation product co san, hoac dung script demo.

3. Goi AI assess:

```bash
curl -X POST http://localhost:5000/api/ai/assess-product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>" \
  -d "{\"productId\":\"<PRODUCT_ID>\",\"extraNote\":\"san pham con tot\"}"
```

Ky vong:
- HTTP 201;
- `data.assessment.status = suggested`;
- `data.reviewRequired = true`;
- product chua bi publish.

### 6.4 Kiem tra pending/list/detail

```bash
curl http://localhost:5000/api/ai/pending \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

```bash
curl http://localhost:5000/api/ai/products/<PRODUCT_ID> \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

Ky vong:
- thay assessment moi tao.

### 6.5 Kiem tra confirm/override

```bash
curl -X POST http://localhost:5000/api/ai/assessments/<ASSESSMENT_ID>/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>" \
  -d "{\"condition\":\"good\",\"quality\":\"medium\",\"suggestedPrice\":80000,\"price\":80000,\"suitableForMarketplace\":true,\"assessmentNote\":\"Human confirmed AI suggestion\"}"
```

Ky vong:
- HTTP 200;
- assessment status `confirmed` hoac `overridden`;
- `appliedToProduct=true`;
- product updated;
- `listedOnMarketplace` van false.

### 6.6 Kiem tra no-auto-publish

Sau confirm, goi product detail:

```bash
curl http://localhost:5000/api/products/<PRODUCT_ID> \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

Ky vong:
- `reviewed=true`;
- co condition/quality/price;
- `listedOnMarketplace=false` cho den khi goi:

```bash
curl -X POST http://localhost:5000/api/products/<PRODUCT_ID>/publish \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

### 6.7 Kiem tra reject

```bash
curl -X POST http://localhost:5000/api/ai/assessments/<ASSESSMENT_ID>/reject \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

Ky vong:
- assessment status `rejected`;
- product khong doi;
- `appliedToProduct=false`.

## 7. Checklist kiem tra frontend `regive-user`

Can:
- backend dang chay;
- `regive-user` tro `NEXT_PUBLIC_API_URL` ve backend, mac dinh `http://localhost:5000/api`;
- user login.

Steps:
1. Mo `/campaigns`.
2. Chon campaign active.
3. Vao donate product: `/campaigns/:id/donate-product`.
4. Nhap ten vat pham, vi du `Ao khoac con tot`.
5. Bam "Tham dinh cung AI".
6. Ky vong UI hien ket qua:
   - condition;
   - quality;
   - estimated value;
   - confidence;
   - impact metrics.
7. Bam "Ap dung thong so nay".
8. Ky vong form duoc dien:
   - category;
   - estimatedValue;
   - conditionNote.
9. Submit donation.
10. Ky vong tao donation product thanh cong.

Luu y: buoc nay khong tao `AiAssessment`. Day la preview cho user, khong phai workflow staff review.

## 8. Demo script co san

Backend co script:

```bash
cd backend
npm run demo:e2e
```

Script nay co luong:
1. employee login;
2. user login;
3. tao product tu donation;
4. goi `/ai/assess-product`;
5. confirm AI assessment;
6. stock in;
7. publish product;
8. order/payment/report.

Can luu y sau thay doi VNPay: neu script demo con phu thuoc sandbox payment cu, phan payment co the can cap nhat rieng. Phan AI cua script van la nguon tham khao tot cho workflow backend.

## 9. Ket luan trien khai

AI da duoc trien khai o muc backend core va user preview:
- du cho demo AI-assisted product assessment;
- du de chung minh human-in-the-loop;
- dung yeu cau khong auto-publish.

AI da co Gemini provider, nhung chua phai custom trained model:
- co call Gemini khi `AI_PROVIDER=gemini`;
- anh URL/data URI duoc gui dang inline image neu backend fetch/parse duoc;
- khong co UI staff review trong `regive-user`;
- OpenAPI can cap nhat neu dung lam tai lieu API chinh.

Neu muc tieu la bao ve capstone/demo: co the noi "AI workflow da trien khai bang mock/heuristic provider, co human review backend, user co preview UI".

Neu muc tieu la san pham that: can bo sung external provider, upload anh thuc, admin/employee review UI, cap nhat OpenAPI va test tu dong cho cac route AI.
