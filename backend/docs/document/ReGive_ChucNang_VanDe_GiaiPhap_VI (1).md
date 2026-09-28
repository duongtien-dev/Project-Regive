# ReGive — Chức năng, Vấn đề và Giải pháp

> Tài liệu này được rút gọn từ Proposal ReGive và chỉ giữ lại:
> - Vấn đề của hệ thống
> - Giải pháp đề xuất
> - Các chức năng chính theo từng vai trò
> - Công nghệ triển khai đã được cập nhật theo yêu cầu hiện tại của dự án

---

# 1. Vấn đề của hệ thống

## 1.1 Khó khăn trong hoạt động từ thiện

Hiện nay các hoạt động từ thiện thường gặp khó khăn trong việc kết nối:

- Người muốn quyên góp
- Người muốn tham gia tình nguyện
- Người cần được hỗ trợ
- Người muốn mua sản phẩm second-hand để đóng góp gián tiếp cho hoạt động từ thiện

Người dùng có thể khó tìm được các chiến dịch từ thiện có thông tin rõ ràng về:

- Mục tiêu chiến dịch
- Thời gian
- Địa điểm
- Nội dung hoạt động
- Hình thức quyên góp
- Cơ hội tham gia tình nguyện

---

## 1.2 Khó khăn trong quản lý quyên góp

Khi có nhiều sản phẩm hoặc tiền được quyên góp, việc quản lý thủ công dễ gây ra:

- Sai thông tin
- Trùng dữ liệu
- Khó theo dõi trạng thái quyên góp
- Khó phân loại sản phẩm
- Khó biết sản phẩm đang ở đâu
- Khó biết sản phẩm đã được phân phối hay chưa

Đối với sản phẩm quyên góp, hệ thống cần xử lý các bước như:

1. Tiếp nhận sản phẩm
2. Ghi nhận thông tin
3. Phân loại
4. Đánh giá tình trạng
5. Đánh giá chất lượng
6. Lưu kho
7. Phân phối cho người cần hỗ trợ hoặc đăng bán trên marketplace

---

## 1.3 Khó khăn trong quản lý kho và đơn hàng

Nếu quản lý bằng phương pháp thủ công sẽ khó:

- Theo dõi số lượng sản phẩm còn trong kho
- Theo dõi vị trí lưu trữ sản phẩm
- Quản lý nhập kho và xuất kho
- Kiểm tra sản phẩm còn hàng hay hết hàng
- Xử lý đơn hàng
- Theo dõi trạng thái đơn hàng
- Quản lý thanh toán

---

## 1.4 Khó khăn trong quản lý người thụ hưởng

Người cần được hỗ trợ có thể gặp khó khăn trong việc:

- Gửi yêu cầu hỗ trợ
- Cung cấp thông tin cần thiết
- Theo dõi trạng thái yêu cầu
- Biết yêu cầu đã được duyệt hay chưa
- Biết khi nào nhận được hỗ trợ

Phía tổ chức cũng khó quản lý nhiều yêu cầu hỗ trợ nếu không có hệ thống tập trung.

---

## 1.5 Khó khăn trong quản lý tình nguyện viên

Người muốn tham gia tình nguyện có thể gặp khó khăn khi:

- Tìm chiến dịch phù hợp
- Đăng ký làm tình nguyện viên
- Theo dõi trạng thái đăng ký
- Theo dõi lịch hoạt động

Phía tổ chức cũng cần một hệ thống để:

- Quản lý volunteer
- Quản lý lịch volunteer
- Điều phối volunteer theo chiến dịch

---

## 1.6 Khó khăn trong đánh giá sản phẩm second-hand

Khi có nhiều sản phẩm quyên góp, Employee/Admin phải thực hiện nhiều công việc thủ công như:

- Phân loại sản phẩm
- Kiểm tra tình trạng
- Đánh giá chất lượng
- Ước lượng giá bán

Việc này:

- Tốn thời gian
- Phụ thuộc nhiều vào kinh nghiệm người đánh giá
- Có thể không đồng nhất giữa các nhân viên

---

# 2. Giải pháp của ReGive

ReGive xây dựng một nền tảng tập trung kết hợp:

- Hoạt động từ thiện
- Quyên góp tiền
- Quyên góp sản phẩm
- Tình nguyện
- Hỗ trợ người thụ hưởng
- Quản lý kho
- Marketplace second-hand
- Đơn hàng
- Thanh toán
- AI hỗ trợ đánh giá sản phẩm

---

## 2.1 Giải pháp cho hoạt động từ thiện

Người dùng có thể xem các chiến dịch từ thiện với thông tin rõ ràng như:

- Tên chiến dịch
- Mô tả
- Mục tiêu
- Thời gian
- Địa điểm
- Thông tin liên quan

Sau đó người dùng có thể:

- Quyên góp tiền
- Quyên góp sản phẩm
- Đăng ký làm tình nguyện viên

---

## 2.2 Giải pháp quản lý quyên góp

Hệ thống tập trung quản lý:

- Thông tin donation
- Người quyên góp
- Loại quyên góp
- Giá trị quyên góp
- Sản phẩm quyên góp
- Trạng thái xử lý

Người dùng có thể theo dõi trạng thái donation và nhận xác nhận từ hệ thống.

Employee có thể tiếp nhận và xử lý sản phẩm quyên góp.

---

## 2.3 Giải pháp quản lý người thụ hưởng

Beneficiary có thể:

- Gửi yêu cầu hỗ trợ
- Cập nhật thông tin
- Theo dõi trạng thái yêu cầu
- Xem kết quả phê duyệt
- Xác nhận đã nhận hỗ trợ

Employee/Admin có thể quản lý và xử lý các yêu cầu hỗ trợ trên cùng một hệ thống.

---

## 2.4 Giải pháp quản lý tình nguyện viên

User có thể:

- Xem chiến dịch
- Đăng ký volunteer
- Xem trạng thái đăng ký
- Xem lịch volunteer

Employee/Admin có thể:

- Quản lý danh sách volunteer
- Quản lý lịch
- Điều phối volunteer

---

## 2.5 Giải pháp quản lý sản phẩm và kho

Sản phẩm quyên góp có thể được:

- Tiếp nhận
- Ghi nhận thông tin
- Phân loại
- Đánh giá
- Lưu kho
- Quản lý tồn kho
- Đưa lên marketplace nếu phù hợp

Employee có thể quản lý:

- Product
- Inventory
- Warehouse
- Product storage

---

## 2.6 Giải pháp marketplace second-hand

Các sản phẩm quyên góp phù hợp có thể được đăng bán trên marketplace.

Buyer có thể:

- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Đặt hàng
- Thanh toán

Việc bán sản phẩm second-hand giúp:

- Tái sử dụng sản phẩm
- Giảm lãng phí
- Tạo thêm giá trị cho hoạt động từ thiện

---

## 2.7 Giải pháp AI hỗ trợ đánh giá sản phẩm

AI hỗ trợ Employee/Admin bằng cách:

- Phân tích ảnh sản phẩm
- Phân tích thông tin sản phẩm
- Phân loại sản phẩm
- Đánh giá tình trạng
- Đánh giá chất lượng
- Đề xuất giá bán

Kết quả AI không được tự động áp dụng ngay.

Employee hoặc Admin có thẩm quyền phải:

1. Xem kết quả AI
2. Kiểm tra lại
3. Xác nhận hoặc điều chỉnh
4. Sau đó mới áp dụng vào hệ thống

---

# 3. Chức năng theo vai trò

# 3.1 User

User trong hệ thống có thể đóng vai trò:

- Donor
- Volunteer
- Buyer

## Authentication

- Đăng ký tài khoản
- Đăng nhập
- Xác thực bằng JWT
- Quản lý thông tin tài khoản

## Charity Campaign

- Xem danh sách chiến dịch
- Xem chi tiết chiến dịch
- Xem mục tiêu chiến dịch
- Xem thời gian
- Xem địa điểm
- Xem thông tin liên quan

## Donation

- Quyên góp tiền
- Quyên góp sản phẩm
- Xem trạng thái donation
- Nhận xác nhận donation

## Volunteer

- Đăng ký tham gia chiến dịch với vai trò volunteer
- Xem trạng thái đăng ký
- Xem lịch volunteer
- Xem thông tin chiến dịch đã tham gia

## Marketplace

- Xem danh sách sản phẩm second-hand
- Xem chi tiết sản phẩm

## Order

- Tạo đơn hàng
- Xem thông tin đơn hàng
- Theo dõi trạng thái đơn hàng

## Payment

- Thanh toán đơn hàng
- Thanh toán donation
- Nhận kết quả thanh toán

---

# 3.2 Beneficiary

## Beneficiary Information

- Cung cấp thông tin cá nhân cần thiết
- Cập nhật thông tin beneficiary

## Support Request

- Gửi yêu cầu hỗ trợ
- Xem chi tiết yêu cầu
- Theo dõi trạng thái
- Xem kết quả phê duyệt

## Support Confirmation

- Xác nhận đã nhận hỗ trợ

## Notification

- Nhận thông tin hỗ trợ
- Nhận kết quả phê duyệt
- Nhận thông báo hệ thống

---

# 3.3 Employee

## Donation Management

- Tiếp nhận sản phẩm quyên góp
- Ghi nhận donation
- Quản lý thông tin donation

## Product Assessment

- Kiểm tra sản phẩm
- Phân loại sản phẩm
- Đánh giá tình trạng
- Đánh giá chất lượng
- Xem kết quả AI hỗ trợ

## Product Management

- Quản lý thông tin sản phẩm
- Cập nhật thông tin sản phẩm

## Warehouse & Inventory

- Quản lý sản phẩm trong kho
- Quản lý inventory
- Theo dõi product storage

## Order Management

- Xem đơn hàng
- Xử lý đơn hàng
- Cập nhật trạng thái đơn hàng

## Beneficiary Management

- Xem yêu cầu hỗ trợ
- Quản lý thông tin beneficiary
- Xử lý yêu cầu hỗ trợ

## Volunteer Management

- Quản lý volunteer
- Quản lý lịch volunteer
- Điều phối volunteer

## Report & Notification

- Xem thông tin vận hành
- Xem report
- Xem notification

---

# 3.4 Admin

## User & Role Management

- Xem danh sách user
- Quản lý user
- Quản lý role

## Donation Management

- Quản lý donor
- Quản lý donation

## Campaign Management

- Quản lý charity campaign

## Product Management

- Quản lý product
- Quản lý thông tin sản phẩm

## Inventory Management

- Quản lý inventory
- Theo dõi warehouse

## Volunteer & Employee Management

- Quản lý volunteer
- Quản lý employee

## Beneficiary Management

- Quản lý beneficiary
- Quản lý support activity

## Order & Marketplace Management

- Quản lý order
- Quản lý hoạt động marketplace

## Financial Management

- Xem thông tin tài chính
- Quản lý thông tin tài chính

## Dashboard & Report

- Xem dashboard
- Xem thống kê
- Tạo report

## Notification

- Quản lý system notification

## AI Review

- Xem kết quả AI
- Xem product classification
- Xem condition assessment
- Xem quality assessment
- Xem suggested price
- Xác nhận hoặc điều chỉnh kết quả AI trước khi áp dụng

---

# 3.5 AI Component

AI không phải role người dùng mà là một thành phần hỗ trợ hệ thống.

AI nhận:

- Product images
- Product information

AI xử lý:

- Product classification
- Condition assessment
- Quality assessment
- Price recommendation

AI trả kết quả về backend.

Kết quả cuối cùng vẫn cần Employee/Admin có thẩm quyền kiểm tra và xác nhận.

---

# 4. Nhóm chức năng chính của hệ thống

AI khi implement có thể chia hệ thống thành các module sau:

```text
Authentication
User Management
Role Management

Campaign Management

Donation Management
Product Donation Management

Volunteer Management
Volunteer Registration
Volunteer Schedule

Beneficiary Management
Support Request Management

Product Management
Product Assessment

Warehouse Management
Inventory Management

Marketplace
Order Management
Payment

Notification

Dashboard
Report
Financial Management

AI Product Analysis
```

---

# 5. Công nghệ triển khai hiện tại

> Phần này là công nghệ hiện tại do nhóm dự án lựa chọn và được dùng để thay thế stack cũ trong proposal.

## Frontend

```text
ReactJS
Vite
Tailwind CSS
JavaScript hoặc TypeScript
```

Khuyến nghị cấu trúc:

```text
React Vite
   ↓
Page
   ↓
Component
   ↓
Custom Hook
   ↓
Service
   ↓
Axios
   ↓
Backend API
```

## Backend

```text
Node.js
Express.js
MongoDB
Mongoose
RESTful API
JWT Authentication
```

Backend đã chốt triển khai với:

```text
Node.js
Express.js
MongoDB
Mongoose
JWT
```

> Nhóm đã chọn **Express.js** (không dùng NestJS / Java Spring Boot) cho implementation hiện tại.

## Database

```text
MongoDB
```

## API

```text
RESTful API
```

## Authentication

```text
JWT
```

## Frontend Styling

```text
Tailwind CSS
```

## Version Control

```text
Git
GitHub
```

---

# 6. Luồng tổng quát hệ thống

```text
Người dùng
   ↓
React Vite Frontend
   ↓
Page
   ↓
Component
   ↓
Hook
   ↓
Service
   ↓
Axios
   ↓
REST API
   ↓
Node.js Backend
   ↓
MongoDB
```

Đối với chức năng AI:

```text
Employee / Admin
      ↓
Frontend
      ↓
Node.js Backend
      ↓
Gửi ảnh + thông tin sản phẩm
      ↓
AI Service / AI API
      ↓
Classification
Condition Assessment
Quality Assessment
Price Recommendation
      ↓
Node.js Backend
      ↓
Lưu kết quả
      ↓
Employee / Admin Review
      ↓
Confirm / Edit
      ↓
Áp dụng vào sản phẩm
```

---

# 7. Phạm vi AI không được tự suy đoán

Proposal chưa quy định đầy đủ các nội dung sau:

- Database schema cụ thể
- Tên collection MongoDB
- API endpoint cụ thể
- Request/response format
- Permission matrix chi tiết
- Order status cụ thể
- Donation status cụ thể
- Campaign status cụ thể
- Payment provider
- Shipping/delivery flow
- Refund flow
- AI provider/model
- AI confidence threshold
- Product pricing formula
- Notification gửi qua email/SMS/in-app
- UI chi tiết
- Routing chi tiết
- Deployment
- Hosting
- CI/CD

Nếu cần implement các phần trên, AI phải dựa trên tài liệu bổ sung hoặc yêu cầu trực tiếp của nhóm dự án, không được tự xem là yêu cầu chính thức.

---

# 8. Prompt dùng cho AI coding assistant

```text
Hãy đọc toàn bộ file này trước khi implement.

Đây là tài liệu mô tả chức năng, vấn đề và giải pháp chính của dự án ReGive.

Technology stack hiện tại:

Frontend:
- React Vite
- Tailwind CSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- REST API
- JWT

Không sử dụng Java Spring Boot trong implementation hiện tại.

Hãy sử dụng nội dung trong file làm source of truth cho business scope.

Không tự ý thêm chức năng không được mô tả.
Không tự ý tạo business rule nếu tài liệu chưa xác định.

Khi tôi yêu cầu implement một chức năng:
1. Xác định chức năng thuộc role nào.
2. Xác định module liên quan.
3. Phân tích flow.
4. Đề xuất cấu trúc cần thiết.
5. Sau đó mới viết code.

Nếu thiếu API contract, database schema hoặc business rule quan trọng,
hãy hỏi tôi trước khi tự quyết định.
```
