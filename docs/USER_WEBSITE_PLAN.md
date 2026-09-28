# Kế hoạch Website Người dùng ReGive

## Tech Stack Đề Xuất

Website phía người dùng sẽ sử dụng:

- **Next.js (TypeScript)** cho routing, cấu trúc page, SSR/SSG khi cần SEO cho campaign và marketplace.
- **Axios** cho API client, intercept token JWT, xử lý error response và refresh state sau payment/order/donation.
- **Tailwind CSS** cho layout, spacing, responsive và custom theme.
- **Ant Design** cho các component hệ thống như: form, input, modal, table, tabs, steps, notification, pagination, empty state, badge, dropdown.
- **Zustand,Lucide-icon,moment,...**

Hướng thiết kế: dùng **Ant Design** làm nền tảng component chuẩn, **Tailwind CSS** để tinh chỉnh layout và visual. Không tạo quá nhiều style riêng nếu Ant Design đã có component phù hợp.

## Mục Tiêu

Xây dựng website phía người dùng cho **ReGive**, tập trung vào các role và workflow thực tế hiện có trong backend:

- `USER`: người quyên góp, tình nguyện viên, người mua hàng.
- `BENEFICIARY`: người cần hỗ trợ, có thể tạo và theo dõi yêu cầu hỗ trợ.

Website `https://thiennguyen.app/` được sử dụng làm tham chiếu UX: trang chủ có chiến dịch nổi bật, điều hướng đến các khu vực như ủng hộ, chiến dịch, đồng hành, sự kiện, bản đồ, bảng tin, tin tức; đồng thời có CTA khám phá chiến dịch và bắt đầu gây quỹ.

## Backend Hiện Có

Backend Express/MongoDB hiện đang mount các API chính:

- `/api/auth`: đăng ký, đăng nhập, profile.
- `/api/campaigns`: danh sách và chi tiết chiến dịch đang hoạt động.
- `/api/donations`: tạo và theo dõi quyên góp.
- `/api/volunteers`: đăng ký và theo dõi tình nguyện viên.
- `/api/support-requests`: beneficiary tạo và theo dõi yêu cầu hỗ trợ.
- `/api/notifications`: thông báo người dùng.
- `/api/products/marketplace`: danh sách sản phẩm đang bán.
- `/api/orders`: tạo và theo dõi đơn hàng.
- `/api/payments`: tạo và xác nhận thanh toán sandbox.

### Phân quyền RBAC

- `USER`: quyên góp tiền/sản phẩm, đăng ký tình nguyện, xem/mua sản phẩm marketplace, tạo thanh toán.
- `BENEFICIARY`: tạo yêu cầu hỗ trợ, xác nhận đã nhận hỗ trợ.
- `EMPLOYEE` và `ADMIN`: vận hành nội bộ, không nằm trong website phía người dùng.

## Workflow Chính

### Người dùng Quyên Góp Tiền

1. Xem danh sách campaign đang hoạt động.
2. Mở chi tiết campaign.
3. Chọn **"Ủng hộ tiền"**.
4. Nhập số tiền và ghi chú.
5. Tạo donation với type `money`.
6. Tạo payment với purpose `donation`.
7. Xác nhận thanh toán sandbox.
8. Donation chuyển sang `completed`, đồng thời `raisedAmount` của campaign tăng lên.

### Người dùng Quyên Góp Hiện Vật

1. Xem campaign đang hoạt động.
2. Chọn **"Ủng hộ hiện vật"**.
3. Nhập tên vật phẩm, số lượng, mô tả và ghi chú tình trạng.
4. Tạo donation với type `product`.
5. Theo dõi trạng thái donation:
   - `pending`
   - `processing`
   - `completed`
   - `rejected`

Lưu ý: quy trình tiếp nhận sản phẩm, AI đánh giá, nhập kho và đưa sản phẩm lên marketplace thuộc workflow của staff, không đưa vào UI phía người dùng.

### Tình Nguyện Viên

1. Xem campaign đang hoạt động.
2. Chọn **"Đăng ký tình nguyện"**.
3. Nhập kỹ năng và ghi chú thời gian có thể tham gia.
4. Theo dõi trạng thái:
   - `pending`
   - `approved`
   - `rejected`
   - `cancelled`
5. Nếu được duyệt, hiển thị lịch tham gia gồm:
   - Ngày.
   - Khung giờ.
   - Địa điểm.

### Người Mua Hàng Marketplace

1. Xem marketplace.
2. Lọc theo category và condition.
3. Mở chi tiết sản phẩm.
4. Chọn **Buy Now**.
5. Tạo order với:
   - Quantity.
   - Shipping address.
   - Phone.
   - Note.
6. Tạo payment với purpose `order`.
7. Xác nhận thanh toán sandbox.
8. Order chuyển sang `paid`, số lượng tồn kho của sản phẩm giảm.

### Người Thụ Hưởng – Beneficiary

1. Đăng ký với role `BENEFICIARY`.
2. Cập nhật `beneficiaryInfo` nếu cần.
3. Tạo support request với:
   - Title.
   - Description.
   - Urgency.
   - CampaignId nếu có.
4. Theo dõi trạng thái:
   - `pending`
   - `approved`
   - `rejected`
   - `in_progress`
   - `completed`
5. Khi đã nhận hỗ trợ, người dùng bấm **Confirm Received**.

## Sitemap Đề Xuất

### Public

- `/`: Trang chủ.
- `/campaigns`: Danh sách chiến dịch.
- `/campaigns/:id`: Chi tiết chiến dịch.
- `/marketplace`: Marketplace.
- `/marketplace/:id`: Chi tiết sản phẩm.
- `/about`: Giới thiệu.
- `/faq`: Hỏi đáp.
- `/policy`: Chính sách / điều khoản.

### Xác Thực và Tài Khoản

- `/login`: Đăng nhập.
- `/register`: Đăng ký, chọn `USER` hoặc `BENEFICIARY`.
- `/profile`: Cập nhật thông tin cá nhân.
- `/notifications`: Thông báo.

### User Dashboard

- `/me/dashboard`: Tổng quan người dùng.
- `/me/donations`: Lịch sử quyên góp.
- `/me/donations/:id`: Chi tiết quyên góp.
- `/me/volunteers`: Các đăng ký tình nguyện của tôi.
- `/me/volunteers/:id`: Chi tiết đăng ký tình nguyện.
- `/me/orders`: Đơn hàng của tôi.
- `/me/orders/:id`: Chi tiết đơn hàng.
- `/me/payments`: Lịch sử thanh toán.

### Donation và Volunteer

- `/campaigns/:id/donate-money`: Form quyên góp tiền.
- `/campaigns/:id/donate-product`: Form quyên góp hiện vật.
- `/campaigns/:id/volunteer`: Form đăng ký tình nguyện.
- `/payments/:id/checkout`: Màn hình thanh toán sandbox.

### Beneficiary

- `/support/new`: Tạo yêu cầu hỗ trợ.
- `/me/support-requests`: Danh sách yêu cầu hỗ trợ.
- `/me/support-requests/:id`: Chi tiết yêu cầu hỗ trợ.

## Màn Hình Chi Tiết

### Trang Chủ

Các thành phần nên có:

- Header gồm search, campaigns, marketplace, volunteer, support và account.
- Hero giới thiệu ReGive và CTA khám phá chiến dịch.
- Các chiến dịch nổi bật.
- Thống kê tác động:
  - Số chiến dịch.
  - Số lượt ủng hộ.
  - Tổng số tiền đã gây quỹ.
  - Số sản phẩm được tái sử dụng.
- Marketplace teaser.
- Volunteer CTA.
- Transparency section giải thích quy trình donation, payment và status tracking.

### Danh Sách Chiến Dịch

Thành phần:

- Search theo title.
- Filter theo location, date và progress.
- Campaign card gồm:
  - Title.
  - Location.
  - Date.
  - Target amount.
  - Raised amount.
  - Progress.
- Empty state khi không có campaign.

### Chi Tiết Chiến Dịch

Thành phần:

- Title.
- Description.
- Goal.
- Location.
- Ngày bắt đầu / kết thúc.
- Progress bar dựa trên `targetAmount / raisedAmount`.
- CTA:
  - Ủng hộ tiền.
  - Ủng hộ hiện vật.
  - Đăng ký tình nguyện.
- Section giải thích trạng thái donation và volunteer.

### Quyên Góp Tiền

Các field:

- Amount.
- Note.

Flow:

1. Submit `POST /api/donations`.
2. Tạo payment bằng `POST /api/payments`.
3. Chuyển sang trang checkout sandbox.

### Quyên Góp Hiện Vật

Các field:

- Tên sản phẩm.
- Số lượng.
- Mô tả.
- Ghi chú tình trạng.
- Ghi chú khác.

Sau khi submit, hiển thị trạng thái `pending` và hướng dẫn người dùng chờ xử lý.

### Đăng Ký Tình Nguyện

Các field:

- Skills.
- Availability note.

Sau khi submit, hiển thị trạng thái `pending` và thông báo đang chờ xét duyệt.

### Marketplace

Thành phần:

- Product grid.
- Filter category.
- Filter condition.
- Product card gồm:
  - Image.
  - Name.
  - Price.
  - Condition.
  - Stock quantity.

### Chi Tiết Sản Phẩm

Thành phần:

- Images.
- Name.
- Description.
- Category.
- Condition.
- Quality.
- Price.
- Stock.
- Campaign liên quan nếu có.
- Nút **Buy Now**.

### Checkout Đơn Hàng

Các field:

- Quantity.
- Shipping address.
- Phone.
- Note.

Flow:

1. Submit `POST /api/orders`.
2. Tạo payment bằng `POST /api/payments`.
3. Chuyển sang checkout sandbox.

### Payment Checkout

Thành phần:

- Payment code.
- Amount.
- Purpose.
- Sandbox token hint.
- Nút xác nhận thanh toán.
- Kết quả thành công / thất bại.

### Beneficiary Support Request

Các field:

- Title.
- Description.
- Urgency:
  - `low`
  - `medium`
  - `high`
- `campaignId` tùy chọn.

Trang chi tiết có thể bao gồm:

- Status badge.
- Review note.
- Nút **Xác nhận đã nhận hỗ trợ** khi trạng thái phù hợp như:
  - `approved`
  - `in_progress`
  - `completed`

## Component Dùng Chung

- `AppHeader`
- `Footer`
- `SearchInput`
- `CampaignCard`
- `ProductCard`
- `StatusBadge`
- `ProgressBar`
- `MoneyInput`
- `EmptyState`
- `AuthGuard`
- `RoleGuard`
- `NotificationBell`
- `PaymentPanel`
- `Timeline`

## Các Trạng Thái Cần Map Ra UI

### Donation

- `pending`: Chờ xác nhận.
- `confirmed`: Đã xác nhận, chờ thanh toán / xử lý.
- `processing`: Đang xử lý.
- `completed`: Hoàn tất.
- `rejected`: Bị từ chối.

### Volunteer

- `pending`: Chờ duyệt.
- `approved`: Đã duyệt.
- `rejected`: Bị từ chối.
- `cancelled`: Đã hủy.

### Support Request

- `pending`: Chờ duyệt.
- `approved`: Đã duyệt.
- `rejected`: Bị từ chối.
- `in_progress`: Đang hỗ trợ.
- `completed`: Hoàn tất.

### Order

- `pending`: Chờ thanh toán.
- `paid`: Đã thanh toán.
- `processing`: Đang xử lý.
- `shipped`: Đang giao.
- `completed`: Hoàn tất.
- `cancelled`: Đã hủy.

### Payment

- `pending`: Chờ thanh toán.
- `success`: Thành công.
- `failed`: Thất bại.
- `cancelled`: Đã hủy.

## Khoảng Trống Backend Nếu Muốn Phát Triển Giống Thiện Nguyện Đầy Đủ

Một số module có trên website tham chiếu nhưng backend ReGive hiện tại chưa có API riêng:

- Đồng hành gây quỹ / companion fundraising.
- Bản đồ thiện nguyện.
- Sự kiện thiện nguyện.
- Bảng tin / news feed.
- Tin tức.
- Profile tổ chức / cá nhân gây quỹ.
- Sao kê công khai chi tiết theo từng campaign.

## Phạm Vi MVP Nên Ưu Tiên

Theo backend hiện tại, phiên bản MVP nên ưu tiên theo thứ tự:

1. Xem và tìm kiếm chiến dịch.
2. Quyên góp tiền / hiện vật.
3. Đăng ký tình nguyện viên.
4. Xem và mua sản phẩm trên marketplace.
5. Thanh toán sandbox.
6. Beneficiary tạo yêu cầu hỗ trợ.
7. User Dashboard và Notifications.
