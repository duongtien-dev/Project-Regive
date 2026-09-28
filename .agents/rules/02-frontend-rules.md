# ReGive Frontend Rules

## Component
Ưu tiên theo thứ tự:

1. Component có sẵn trong project
2. Ant Design
3. Tailwind CSS
4. Tạo component mới khi thật sự cần

## Structure
Ưu tiên flow:

Page
→ Component
→ Hook
→ Service
→ Axios
→ Backend API

## Coding
- TypeScript strict.
- Reuse type/interface đã có.
- Component không chứa quá nhiều business logic.
- API không gọi trực tiếp rải rác trong UI nếu project đã có service layer.
- Dùng Zustand chỉ khi state cần dùng nhiều nơi.

## UI
Mỗi page API-driven phải xử lý:
- loading
- error
- empty
- success

Responsive:
- mobile
- tablet
- desktop

Ant Design dùng cho:
- Form
- Input
- Select
- Modal
- Tabs
- Steps
- Pagination
- Notification
- Empty
- Skeleton

Tailwind dùng cho:
- layout
- spacing
- responsive
- typography
- visual adjustment

## Design
UI ReGive phải:
- sạch
- dễ hiểu
- đáng tin cậy
- hiện đại
- dễ thao tác

Public UI tham khảo UX từ:
https://thiennguyen.app/
