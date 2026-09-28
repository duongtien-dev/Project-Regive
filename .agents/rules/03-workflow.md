# ReGive Workflow

Mỗi task phải làm theo thứ tự:

1. Đọc `USER_WEBSITE_PLAN.md`.
2. Đọc các rule trong `.agents/rules/`.
3. Tìm code hiện tại liên quan.
4. Nếu có API:
   - kiểm tra route
   - controller
   - request body
   - response
   - auth/RBAC
5. Nếu là UI public:
   - xem `https://thiennguyen.app/`
   - tham khảo layout và UX
6. Xác định file cần sửa/tạo.
7. Reuse code trước khi tạo mới.
8. Implement task.
9. Kiểm tra:
   - TypeScript
   - loading/error/empty
   - responsive
   - API flow
10. Chạy lint/build nếu có.
11. Review lại diff trước khi hoàn thành.

## Không được
- Code ngay khi chưa đọc document.
- Bịa API.
- Refactor ngoài phạm vi task.
- Copy nguyên UI của website tham chiếu.
- Tạo dependency mới nếu chưa cần.
