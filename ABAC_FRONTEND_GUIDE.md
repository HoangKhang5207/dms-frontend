# ABAC Frontend Integration Guide

## Tổng quan

Frontend đã được tích hợp ABAC (Attribute-Based Access Control) với các tính năng chính:

1. **ABACShareModal** - Modal chia sẻ tài liệu với ABAC permissions
2. **DocumentPermissions** - Component hiển thị thông tin permissions
3. **DocumentPermissionsPage** - Trang quản lý permissions chi tiết
4. **abacService** - Service gọi API ABAC

## Cấu trúc Components

### 1. ABACShareModal (`/src/components/ABACShareModal/`)

Modal chia sẻ tài liệu với 5 loại ABAC permissions:

```jsx
<ABACShareModal
  show={showModal}
  onHide={handleClose}
  documentId={documentId}
  documentInfo={documentInfo}
/>
```

**Tính năng:**

- Chọn loại quyền truy cập (readonly, forwardable, timebound, external, orgscope)
- Chọn người dùng để chia sẻ
- Đặt thời hạn cho timebound permissions
- Chọn phạm vi cho orgscope permissions
- Validation theo loại tài liệu

### 2. DocumentPermissions (`/src/components/DocumentPermissions/`)

Component hiển thị thông tin permissions của document:

```jsx
<DocumentPermissions documentId={documentId} documentInfo={documentInfo} />
```

**Tính năng:**

- Hiển thị loại truy cập của tài liệu
- Hiển thị quyền truy cập chi tiết
- Modal xem chi tiết permissions
- Badge màu sắc cho từng loại permission

### 3. DocumentPermissionsPage (`/src/pages/Home/DocumentManagement/`)

Trang quản lý permissions chi tiết:

```jsx
// Route: /home/document-management/permissions/:documentId
<DocumentPermissionsPage />
```

**Tính năng:**

- Danh sách tất cả permissions của document
- Chỉnh sửa permissions
- Xóa permissions
- Thêm permissions mới
- Xem thông tin chi tiết

### 4. abacService (`/src/services/abacService.js`)

Service gọi các API ABAC:

```javascript
import abacService from "../services/abacService";

// Đánh giá quyền truy cập
const decision = await abacService.evaluateAccess(docId, "READ");

// Chia sẻ document
await abacService.shareDocument(docId, shareRequest);

// Lấy danh sách user có thể chia sẻ
const users = await abacService.getShareableUsers(docId, permissionTypes);
```

## Tích hợp vào DocumentView

Đã tích hợp nút chia sẻ vào bảng documents:

```jsx
// Trong DocumentView.jsx
const handleShareDocument = (record) => {
    setSelectedDocument(record);
    setShowABACShareModal(true);
};

// Trong columns
{
    title: "Hành động",
    key: "action",
    render: (_, record) => (
        <Space>
            <Tooltip title="Chia sẻ tài liệu">
                <Button
                    icon={<ShareAltOutlined />}
                    onClick={() => handleShareDocument(record)}
                />
            </Tooltip>
            {/* Other actions */}
        </Space>
    ),
}
```

## 5 Loại ABAC Permissions

### 1. `documents:share:readonly`

- **Mô tả**: Chỉ đọc tài liệu
- **Icon**: 👁️ (fa-eye)
- **Màu**: Success (xanh lá)
- **Validation**: Không có

### 2. `documents:share:forwardable`

- **Mô tả**: Có thể chia sẻ tiếp
- **Icon**: 📤 (fa-share)
- **Màu**: Primary (xanh dương)
- **Validation**: Không có

### 3. `documents:share:timebound`

- **Mô tả**: Có thời hạn truy cập
- **Icon**: ⏰ (fa-clock)
- **Màu**: Warning (vàng)
- **Validation**: Yêu cầu chọn thời hạn

### 4. `documents:share:external`

- **Mô tả**: Chia sẻ ngoài tổ chức
- **Icon**: 🌐 (fa-external-link-alt)
- **Màu**: Danger (đỏ)
- **Validation**: Chỉ áp dụng cho tài liệu access_type = 1 (Ngoại bộ)

### 5. `documents:share:orgscope`

- **Mô tả**: Trong phạm vi tổ chức
- **Icon**: 🏢 (fa-building)
- **Màu**: Info (xanh dương nhạt)
- **Validation**: Chỉ chia sẻ cho user cùng tổ chức

## API Endpoints

### 1. Đánh giá quyền truy cập

```
GET /api/abac/evaluate/{docId}?action={action}
```

### 2. Chia sẻ document

```
POST /api/abac/documents/{docId}/share
```

### 3. Lấy danh sách user có thể chia sẻ

```
GET /api/abac/documents/{docId}/shareable-users?permissionTypes={types}
```

### 4. Kiểm tra quyền chia sẻ

```
GET /api/abac/documents/{docId}/can-share
```

### 5. Lấy tất cả permissions

```
GET /api/abac/documents/{docId}/all-permissions
```

### 6. Cập nhật permission

```
PUT /api/abac/documents/{docId}/permissions
```

### 7. Xóa permission

```
DELETE /api/abac/documents/{docId}/permissions
```

## Luồng hoạt động

### 1. Chia sẻ tài liệu

1. User click nút "Chia sẻ" trong DocumentView
2. Mở ABACShareModal
3. Chọn loại permissions
4. Chọn người dùng
5. Điền thông tin bổ sung (thời hạn, phạm vi)
6. Submit → Gọi API share
7. Hiển thị thông báo thành công/thất bại

### 2. Xem permissions

1. User click "Chi tiết" trong DocumentPermissions
2. Mở modal hiển thị thông tin chi tiết
3. Hiển thị access rights và permissions

### 3. Quản lý permissions

1. Truy cập trang DocumentPermissionsPage
2. Xem danh sách tất cả permissions
3. Chỉnh sửa/xóa permissions
4. Thêm permissions mới

## Validation Rules

### 1. External Sharing

- Chỉ áp dụng cho tài liệu có `access_type = 1` (Ngoại bộ)
- Hiển thị cảnh báo nếu không đúng loại tài liệu

### 2. Timebound Permissions

- Yêu cầu chọn thời hạn
- Thời hạn phải lớn hơn thời gian hiện tại
- Hiển thị trạng thái hết hạn

### 3. User Selection

- Chỉ hiển thị user có thể chia sẻ
- Disable user không phù hợp với permission type
- Hiển thị lý do không thể chia sẻ

## Styling

### 1. Permission Badges

- Màu sắc khác nhau cho từng loại permission
- Icon trực quan
- Hover effects

### 2. Modal Design

- Responsive design
- Form validation
- Loading states
- Error handling

### 3. Table Design

- Sortable columns
- Pagination
- Action buttons
- Status indicators

## Error Handling

### 1. API Errors

- Hiển thị toast notifications
- Fallback values
- Loading states

### 2. Validation Errors

- Form validation
- Real-time feedback
- Disable submit button

### 3. Network Errors

- Retry mechanism
- Offline indicators
- Graceful degradation

## Responsive Design

### 1. Mobile

- Stacked layout
- Touch-friendly buttons
- Simplified forms

### 2. Tablet

- Side-by-side layout
- Medium-sized components
- Optimized spacing

### 3. Desktop

- Full layout
- Advanced features
- Hover effects

## Testing

### 1. Unit Tests

- Component rendering
- Event handling
- State management

### 2. Integration Tests

- API calls
- Form submission
- Modal interactions

### 3. E2E Tests

- User workflows
- Cross-browser testing
- Performance testing

## Performance Optimization

### 1. Lazy Loading

- Component lazy loading
- Image optimization
- Code splitting

### 2. Caching

- API response caching
- Component memoization
- Local storage

### 3. Bundle Optimization

- Tree shaking
- Minification
- Compression

## Security Considerations

### 1. Input Validation

- Client-side validation
- Server-side validation
- XSS prevention

### 2. Authentication

- JWT token handling
- Session management
- Permission checking

### 3. Data Protection

- Sensitive data masking
- Secure API calls
- HTTPS enforcement
