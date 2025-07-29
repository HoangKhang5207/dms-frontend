# Hệ thống Quản lý Tài liệu (DMS) - Giao diện Người dùng

## Giới thiệu

**DMS Genifast - Frontend** là giao diện người dùng cho hệ thống quản lý tài liệu mạnh mẽ và linh hạch, được xây dựng để giúp các tổ chức và doanh nghiệp sắp xếp, lưu trữ, và truy xuất tài liệu một cách hiệu quả. Giao diện được xây dựng bằng React, cung cấp một trải nghiệm người dùng hiện đại, trực quan và đáp ứng (responsive).

Dự án này kết nối với **[dms-backend](https://www.google.com/search?q=https://github.com/hoangkhang5207/dms-backend)** để xử lý toàn bộ logic nghiệp vụ, từ xác thực người dùng, quản lý tổ chức, phòng ban, cho đến các tính năng tìm kiếm và quản lý tài liệu nâng cao.

## Tính năng chính

Giao diện người dùng hỗ trợ đầy đủ các tính năng mạnh mẽ của hệ thống DMS:

### 👤 **Xác thực & Phân quyền Người dùng**

  * **Đăng ký & Đăng nhập:** Giao diện đăng ký, đăng nhập an toàn bằng email/mật khẩu.
  * **Xác thực Email:** Quy trình xác thực tài khoản qua email để đảm bảo tính hợp lệ.
  * **Quên & Đặt lại mật khẩu:** Cho phép người dùng dễ dàng khôi phục quyền truy cập vào tài khoản.
  * **Phân quyền Động:** Giao diện tự động điều chỉnh các chức năng hiển thị dựa trên vai trò của người dùng (Quản lý tổ chức, Quản lý phòng ban, Thành viên).

### 🏢 **Quản lý Tổ chức & Thành viên**

  * **Luồng tạo Tổ chức:** Cho phép người dùng chưa thuộc tổ chức nào có thể gửi yêu cầu tạo một tổ chức mới.
  * **Bảng điều khiển Tổ chức:** Giao diện quản lý tập trung thông tin chung, phòng ban và thành viên.
  * **Quản lý Phòng ban:** Tạo, sửa, xóa phòng ban. Xem danh sách thành viên trong từng phòng ban.
  * **Quản lý Thành viên:** Mời thành viên mới qua email, gán/bãi nhiệm quyền quản lý phòng ban và tổ chức, xóa thành viên khỏi tổ chức.

### 📂 **Quản lý Tài liệu**

  * **Cấu trúc Thư mục & Phòng ban:** Duyệt tài liệu theo cấu trúc phòng ban và thư mục lồng nhau một cách trực quan.
  * **Tải lên & Quản lý:** Tải lên tài liệu mới với các tùy chọn về phạm vi truy cập (Tổ chức, Phòng ban, Riêng tư).
  * **Xem trước Tài liệu:** Tích hợp trình xem trước cho nhiều định dạng file phổ biến (PDF, DOCX, XLSX, hình ảnh,...) ngay trên trình duyệt.
  * **Tìm kiếm Toàn diện:**
      * **Tìm kiếm Đơn giản & Nâng cao:** Tìm kiếm tài liệu theo từ khóa, tên file, loại file, người tạo, và ngày tạo.
      * **Gợi ý Tìm kiếm:** Hỗ trợ gợi ý từ khóa dựa trên lịch sử tìm kiếm.

## Công nghệ sử dụng

  * **Framework:** [React](https://react.dev/) 19
  * **Bundler:** [Vite](https://vitejs.dev/)
  * **Routing:** [React Router DOM](https://reactrouter.com/) v7
  * **UI Library:** [Ant Design](https://ant.design/) v5
  * **State Management:** React Context API
  * **HTTP Client:** [Axios](https://axios-http.com/)
  * **Animation:** [Framer Motion](https://www.framer.com/motion/)
  * **Linting:** [ESLint](https://eslint.org/)

## Hướng dẫn Cài đặt và Chạy dự án

### Yêu cầu

  * [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
  * [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)
  * Dự án **dms-backend** đã được cài đặt và đang chạy trên `http://localhost:8080`.

### Các bước cài đặt

1.  **Clone repository:**

    ```bash
    git clone https://github.com/hoangkhang5207/dms-frontend.git
    cd dms-frontend
    ```

2.  **Cài đặt các dependencies:**

    ```bash
    npm install
    # hoặc
    yarn install
    ```

3.  **Cấu hình môi trường:**
    Dự án được cấu hình để kết nối với backend tại `http://localhost:8080/api/v1`. Nếu bạn chạy backend ở một địa chỉ khác, hãy cập nhật lại file `src/api/axiosInstance.js`:

    ```javascript
    const axiosInstance = axios.create({
        baseURL: 'http://your-backend-url/api/v1', // Thay đổi URL tại đây
    });
    ```

4.  **Chạy ứng dụng:**

    ```bash
    npm run dev
    # hoặc
    yarn dev
    ```

    Ứng dụng sẽ khởi động và có thể truy cập tại `http://localhost:5173` (hoặc một cổng khác nếu cổng 5173 đã được sử dụng).

### Các câu lệnh khác

  * **Build dự án cho production:**
    ```bash
    npm run build
    ```
  * **Chạy lint để kiểm tra code:**
    ```bash
    npm run lint
    ```

## Cấu trúc thư mục

```
dms-frontend/
├── public/                  # Chứa các file tĩnh
├── src/
│   ├── api/                 # Cấu hình Axios
│   ├── assets/              # Hình ảnh, SVG, và các tài nguyên khác
│   ├── components/          # Các component tái sử dụng (Header, Footer,...)
│   ├── contexts/            # React Context cho quản lý state (Auth, Organization,...)
│   ├── hooks/               # Các custom hooks (useDebounce, useInView,...)
│   ├── layouts/             # Các layout chính của ứng dụng (MainLayout, DashboardLayout)
│   ├── pages/               # Các component tương ứng với từng trang
│   ├── routes/              # Cấu hình routing (AppRouter, ProtectedRoute)
│   ├── services/            # Các service (ví dụ: tokenService)
│   ├── styles/              # CSS toàn cục
│   ├── utils/               # Các hàm tiện ích (ví dụ: fileIcons)
│   ├── App.jsx              # Component gốc của ứng dụng
│   └── main.jsx             # Điểm khởi đầu của ứng dụng
├── .gitignore
├── eslint.config.js         # Cấu hình ESLint
├── index.html
├── package.json             # Danh sách dependencies và scripts
└── vite.config.js           # Cấu hình Vite
```

## Tác giả

  * **Tên:** Hoàng Khang
  * **Email:** hoangkhang16112003@gmail.com
  * **GitHub:** [https://github.com/HoangKhang5207](https://github.com/HoangKhang5207)
