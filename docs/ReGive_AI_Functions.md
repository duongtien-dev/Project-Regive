# ReGive - Chức năng AI của dự án

Nguồn: **C2SE_17-Proposal_RG_ver1.1.pdf**

## 1. Tổng quan vai trò của AI

AI trong ReGive được dùng để **hỗ trợ quy trình quản lý sản phẩm quyên góp**. Hệ thống AI phân tích ảnh và thông tin sản phẩm, sau đó trả về kết quả để **Admin hoặc Employee có thẩm quyền xem xét và xác nhận** trước khi áp dụng.

AI không tự động đưa ra quyết định cuối cùng đối với các thông tin quan trọng như tình trạng sản phẩm hoặc giá bán.

---

## 2. Các chức năng AI chính

### 2.1. AI Product Classification - Phân loại sản phẩm

**Mục tiêu:**
- Xác định sản phẩm quyên góp thuộc nhóm/loại nào dựa trên ảnh và thông tin được cung cấp.

**Input:**
- Ảnh sản phẩm.
- Thông tin/mô tả sản phẩm.

**AI xử lý:**
- Phân tích đặc điểm từ ảnh.
- Kết hợp với thông tin sản phẩm.
- Xác định nhóm/loại sản phẩm phù hợp.

**Output:**
- Kết quả phân loại sản phẩm.

**Người xác nhận:**
- Admin hoặc Employee có thẩm quyền.

---

### 2.2. AI Condition Assessment - Đánh giá tình trạng sản phẩm

**Mục tiêu:**
- Hỗ trợ đánh giá tình trạng và chất lượng của sản phẩm được quyên góp.

**Input:**
- Ảnh sản phẩm.
- Thông tin/mô tả sản phẩm.

**AI xử lý:**
- Phân tích tình trạng bên ngoài của sản phẩm.
- Đánh giá chất lượng dựa trên dữ liệu được cung cấp.

**Output:**
- Kết quả đánh giá tình trạng sản phẩm.
- Kết quả đánh giá chất lượng sản phẩm.

**Người xác nhận:**
- Admin hoặc Employee có thẩm quyền.

**Lưu ý:**
- Sản phẩm hư hỏng, không an toàn hoặc không phù hợp để bán lại không nên được duyệt lên marketplace.

---

### 2.3. AI Price Recommendation - Đề xuất giá bán

**Mục tiêu:**
- Đề xuất mức giá phù hợp cho sản phẩm second-hand sau khi sản phẩm được đánh giá.

**Input:**
- Ảnh sản phẩm.
- Thông tin sản phẩm.
- Kết quả phân loại.
- Tình trạng/chất lượng sản phẩm.

**AI xử lý:**
- Phân tích đặc điểm sản phẩm.
- Sử dụng tình trạng và chất lượng của sản phẩm làm cơ sở hỗ trợ định giá.

**Output:**
- Suggested Price - Giá đề xuất.

**Người xác nhận:**
- Admin hoặc Employee có thẩm quyền.

---

## 3. Workflow AI trong hệ thống

```text
Sản phẩm được quyên góp
        |
        v
Employee ghi nhận sản phẩm
        |
        v
Gửi ảnh + thông tin sản phẩm cho AI
        |
        v
+----------------------------------+
|            AI Analysis           |
|----------------------------------|
| 1. Product Classification        |
| 2. Condition Assessment          |
| 3. Quality Assessment            |
| 4. Price Recommendation          |
+----------------------------------+
        |
        v
AI trả kết quả cho hệ thống ReGive
        |
        v
Admin / Authorized Employee review
        |
        +--------------------+
        |                    |
     Approve               Reject/Edit
        |                    |
        v                    v
Lưu kết quả chính thức / Điều chỉnh thông tin
        |
        v
Đưa vào kho hoặc đăng lên Marketplace
```

---

## 4. Input / Output tổng quát của AI

| Thành phần | Nội dung |
|---|---|
| Input | Product Image |
| Input | Product Information |
| Output | Product Classification |
| Output | Product Condition Assessment |
| Output | Product Quality Assessment |
| Output | Suggested Price |

---

## 5. Actor liên quan đến AI

### Employee

Employee có thể:
- Tiếp nhận và ghi nhận sản phẩm quyên góp.
- Đánh giá và phân loại sản phẩm.
- Quản lý thông tin sản phẩm.
- Sử dụng kết quả AI để hỗ trợ quá trình xử lý sản phẩm.

### Admin

Admin có thể:
- Quản lý sản phẩm và tồn kho.
- Review kết quả AI.
- Xác nhận hoặc điều chỉnh kết quả đánh giá sản phẩm.
- Xác nhận hoặc điều chỉnh giá đề xuất trước khi áp dụng.

### AI Component

AI có thể:
- Nhận ảnh sản phẩm và thông tin sản phẩm.
- Phân tích ảnh và dữ liệu sản phẩm.
- Phân loại sản phẩm.
- Đánh giá tình trạng sản phẩm.
- Đánh giá chất lượng sản phẩm.
- Đề xuất giá bán phù hợp.
- Trả kết quả về hệ thống ReGive.

---

## 6. Nguyên tắc sử dụng AI

AI chỉ đóng vai trò **AI-assisted**, không thay thế hoàn toàn quyết định của con người.

Các kết quả quan trọng như:
- Condition Assessment.
- Quality Assessment.
- Price Recommendation.

phải được **Admin hoặc Authorized Employee review và confirm** trước khi được sử dụng chính thức trong hệ thống.

---

## 7. Phạm vi AI trong Version 1

Theo Proposal, phạm vi AI hiện tại tập trung vào **Product Management**, gồm:

1. Phân loại sản phẩm quyên góp.
2. Đánh giá tình trạng sản phẩm.
3. Đánh giá chất lượng sản phẩm.
4. Đề xuất giá bán second-hand.

Proposal hiện **không mô tả** các chức năng AI khác như:
- Chatbot.
- Recommendation sản phẩm cho Buyer.
- Fraud Detection.
- AI phân tích chiến dịch từ thiện.
- AI matching Volunteer với Campaign.
- AI duyệt Beneficiary.

Nếu bổ sung các chức năng này thì đó sẽ là phạm vi mở rộng ngoài nội dung Proposal hiện tại.
