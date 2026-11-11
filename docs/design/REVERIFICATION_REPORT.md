# AquaDocs — kiểm chứng lại và kiểm thử backend thật

Ngày 2026-11-11. Kết luận: hệ thống giao diện AquaDocs đã phủ các route hiện có được chụp và kiểm tra; **chưa đủ điều kiện nghiệm thu toàn bộ ứng dụng hoặc toàn bộ nghiệp vụ**. Kiểm thử backend thật phát hiện các lỗi mà fixture trước đây không thể chứng minh. Không có tỷ lệ tương đồng toàn ứng dụng được tuyên bố.

## Phạm vi và bảo toàn

Đã đọc trạng thái Git, DESIGN.md, APPLICATION_SPECS.md, checkpoint, báo cáo trước và backend audit. Dùng skill design-to-code. Không làm lại phân tích nguồn banner hay cấu trúc backend đã xác minh. Giữ các thay đổi có sẵn, bao gồm diff package-lock.json 10 dòng xóa của working tree trước lần này. Không thêm route, thay thư viện, sửa quyền, thay API contract hay sửa mã nguồn backend. Không commit/push/merge/deploy.

## Những phần đã sửa trong lần kiểm chứng này

| Thành phần | Phát hiện và sửa |
| --- | --- |
| Tải tài liệu trong thư mục | Caller truyền visible/onFinish, modal chỉ nhận open/onSuccess. Nối lại biến thể metadata vào endpoint /documents có sẵn; nhập tiêu đề, loại, phạm vi và tệp; validation thực sự chạy trước request. |
| Tải nhiều tệp | Thiếu categoryId bắt buộc của backend. Thêm phòng ban/thư mục từ context và API hiện có, lấy đủ các trang thư mục, giữ password và endpoint upload-multiple. Form quản lý danh sách tệp theo API Upload của Ant Design. |
| Preview thư mục/tìm kiếm | Props cũ khiến không mở, mỗi dòng tạo thêm modal. Nay chỉ có một modal mỗi trang; dùng numeric-ID download có token cho metadata và giữ UUID retrieve cho tệp mã hóa. |
| WebViewer | Chờ modal mount; hủy fetch cũ, tái sử dụng viewer, dispose khi unmount; trạng thái loading/error/retry; tải blob đã xác thực thay window.open không có token. Giữ SDK và giấy phép hiện có. |
| Lịch chọn khoảng ngày | Ban đầu rộng 702px ở viewport 390px (left -345). Sửa xếp tháng dọc; xem ảnh tiếp tục phát hiện cắt phần trên. Sửa lần hai thành popup mobile neo viewport, cuộn được, kiểm tra cả bốn cạnh và chọn ngày. Áp dụng cùng class cho tìm kiếm nâng cao và active filters. |
| Thông báo tĩnh Ant Design | message/Modal tĩnh nằm ngoài provider. holderRender dùng cùng AquaDocs theme; kiểm tra computed color và font của thông báo thành công. |
| Font | Google Fonts bị ERR_NETWORK_ACCESS_DENIED. Phục vụ đúng Be Vietnam Pro 300–700 nội bộ, kèm OFL chính thức; không đổi font family hoặc thêm package. |
| Bảng tài liệu toàn cục | Backend thật trả id nhưng không trả fileId. Dùng id cho row key/chọn/xóa. Không tạo UUID giả; nút cần UUID bị khóa và có giải thích. Kích thước thiếu hiển thị dấu gạch. |
| Development runtime | Vite bị EBUSY khi watch PDF đang tải. Loại runtime/ảnh QA khỏi watcher; chặn HTTP phục vụ .runtime.local, đã kiểm tra trả 403. |

Tái sử dụng: Ant Design Modal/Form/Upload/Select/Alert/Table/Tooltip/DatePicker, ConfigProvider và token AquaDocs, OrganizationContext, uploadDocument, axiosInstance, AuthContext, toast utilities và WebViewer. Không thêm design token mới.

## Tệp thay đổi/bổ sung trong lần này

- src/App.jsx; src/styles/global.css; src/styles/aquadocs.css; vite.config.js.
- src/pages/Home/DocumentManagement/UploadModal.jsx, FilePreviewModal.jsx, DocumentView.jsx, SearchResultsPage.jsx, DocumentManagementPage.jsx.
- src/components/GlobalSearch/AdvancedSearchModal.jsx và ActiveFiltersForm.jsx.
- src/assets/fonts/BeVietnamPro-{Light,Regular,Medium,SemiBold,Bold}.ttf và OFL.txt.
- docs/design/verify-application.cjs (cho phép output riêng và chia sẻ fixture); verify-completeness.cjs; verify-live.cjs; compare-reverification.py.
- scripts/qa/compose.yml, prepare-runtime.py, start-backend.ps1, init-database.sql, seed-workspace.sql, seed-document.sql, README.md.
- DESIGN.md, APPLICATION_SPECS.md, CHECKPOINT.md, báo cáo này và bằng chứng dưới qa/reverification/. Các thay đổi giao diện từ lần trước được liệt kê trong APPLICATION_REPORT.md.

## Bằng chứng giao diện

- 22 route/state × desktop 1440×900 và mobile 390×844 = **44 ảnh mới với font nội bộ**: [kết quả](qa/reverification/application-final/results.json).
- Full sweep trước lượt tương tác cuối: 148/148. Lượt tương tác cuối tái sử dụng 44 capture và kiểm tra lại geometry/branding: **123/123**, không uncaught JS hoặc request fixture ngoài dự kiến. Không cộng các lượt chồng lặp thành một số coverage.
- Bộ kiểm chứng bổ sung **31/31**: [results.json](qa/reverification/results.json); validation, request contract, static theme, preview/retry/PDF/blob download, lịch, thiếu UUID, chọn và request xóa bằng numeric ID. Đây là fixture, không phải backend thật.
- Landing: **23/23**, fontLoaded=true tại 1672, 1440, 768 và 390px; có kiểm tra overflow 320px: [kết quả](qa/reverification/landing/results.json).
- Banner đúng vùng 1672×941, y=64. RGB MAE **0.033880318369104094/255**, 15.046 pixel khác trên 1.573.352 pixel; không resize/căn chỉnh/tolerance. [Số đo](qa/reverification/landing/comparison.json), [diff](qa/reverification/landing/diff.png), [overlay](qa/reverification/landing/overlay.png). Không diễn giải thành phần trăm tương đồng.
- **44 so sánh trước/sau, 44 overlay, 44 diff** so với bản giao trước: [thư mục](qa/reverification/comparisons). Đây là bằng chứng thay đổi, không phải đánh giá pixel với thiết kế không tồn tại cho các trang nội bộ.
- Ảnh đại diện: [login desktop](qa/reverification/application-final/login-1440.png), [upload mobile](qa/reverification/multi-upload-390.png), [preview lỗi](qa/reverification/preview-error-390.png), [PDF mobile](qa/reverification/preview-pdf-390.png), [lịch mobile](qa/reverification/calendar-390.png), [sửa cắt lịch](qa/reverification/comparisons/calendar-390.png), [dữ liệu thiếu UUID](qa/reverification/metadata-only-390.png).

Bounded verification: lịch có hai lượt sửa sau phát hiện ban đầu; ảnh sau sửa được xem trực tiếp. Không chỉ dựa vào phép đo chiều ngang để kết luận popup đạt.

## Backend và dữ liệu mẫu đã sẵn sàng

Docker Desktop đã khởi động. Compose project riêng aquadocs-ui-qa: PostgreSQL 17-alpine tại 127.0.0.1:55432 (healthy), Redis 7-alpine tại 56379 (running, refresh thật thành công), Mailpit v1.27 tại SMTP 51025/inbox 58025 (healthy). Không dùng PostgreSQL hiện có trên 5432.

Backend JAR Java 21 build thành công, chạy 127.0.0.1:8080. spring.config.location thay toàn bộ cấu hình giao kèm bằng .runtime.local/application-qa.properties; cả hai datasource chỉ trỏ database QA. SMTP chỉ gửi Mailpit. Lần boot đầu lỗi Camunda tạo bảng sai schema; đặt search_path riêng cho role/database QA đã khắc phục, không chỉnh mã backend.

Tài khoản QA được **đăng ký qua UI và xác thực bằng email thật trong Mailpit**. Sau đó seed vai trò quản lý, tổ chức AquaDocs QA, thư mục QA water samples và một PDF không chứa dữ liệu riêng tư. PDF này là **dữ liệu seed rõ ràng**, không được tính là upload thành công. Lần seed đầu thiếu organization_id của thư mục; đã bổ sung quan hệ dữ liệu và chạy lại thành công.

Frontend http://localhost:5173; inbox http://127.0.0.1:58025. Tài khoản/mật khẩu lưu riêng trong .runtime.local/credentials.json (Git-ignored, không in ra báo cáo). API không đăng nhập trả 401; truy cập credentials qua Vite trả 403. Các dịch vụ được giữ chạy theo yêu cầu.

Hướng dẫn tái lập: [scripts/qa/README.md](../../scripts/qa/README.md).

## Kết quả thật và khoảng cách còn lại

| Luồng | Kết quả thực tế / bằng chứng |
| --- | --- |
| Đăng ký → SMTP cục bộ → xác thực → đăng nhập → hồ sơ | Thành công; account 6/7 assertion, assertion thất bại là thương hiệu email. [account-results.json](qa/reverification/live/account-results.json). |
| Chi tiết tổ chức và tạo thư mục qua UI | Thành công trên backend thật. [workspace-results.json](qa/reverification/live/workspace-results.json). |
| Upload metadata PDF | **Không đạt**: POST /documents trả 500; confidentiality=null vi phạm cột NOT NULL. DTO không có trường để UI sửa hợp lệ. Không đặt default DB, bỏ constraint hoặc đoán mức bảo mật. Workspace script exit 1 và timeout chờ thành công; không phải PASS. |
| Upload nhiều tệp mã hóa | **Không đạt**: POST /documents/upload-multiple trả 500, cùng constraint confidentiality. Dữ liệu form vẫn được giữ khi lỗi. Transfers 4/5 assertion, exit 1. [transfers-results.json](qa/reverification/live/transfers-results.json). |
| Xem/tải/tìm kiếm PDF seed; mobile; refresh; anonymous reject | Thành công. Tải về trùng byte với PDF gốc; refresh token qua Redis trả token mới; anonymous /users/me trả 401. Seeded 12/13 assertion, không JS exception. [seeded-results.json](qa/reverification/live/seeded-results.json), [preview thật](qa/reverification/live/preview-real-pdf.png), [search thật](qa/reverification/live/search-real.png), [mobile thật](qa/reverification/live/category-real-390.png). |
| UUID trong danh sách toàn cục | **Không đạt**: /documents/all không trả fileId mà retrieve/ZIP/password API cần. Nút phụ thuộc mã tệp khóa có giải thích; chọn/xóa dùng numeric ID. Không thay contract hoặc đoán UUID từ file path. |
| Thương hiệu email | **Không đạt**: backend gửi subject GENADATA; template/backend presentation chưa đổi. |
| Các luồng chưa chạy thật | Reset password, mời/nhận lời mời, toàn bộ CRUD/quyền thành viên và phòng ban, xóa thật, encrypted preview/sai mật khẩu/ZIP/watermark, workflow/Kafka/Azure. Không đánh dấu PASS. Các fixture trước chỉ chứng minh UI state tương ứng. |

## Build, lint và giới hạn

- npm run build: exit 0 sau thay đổi cuối, 3.520 modules. JS ~1.688 MB trước gzip, PNG ~2.179 MB, font TTF ~683 KB tổng cộng; chunk warning còn tồn tại.
- Lint các JSX/config sửa trong lượt này: exit 0, 0 error/1 warning useEffect fetchDocuments đã có.
- npm run lint: exit 1, **8.099 errors/431 warnings**, gồm generated WebViewer và baseline. [Log](qa/reverification/lint-full.txt). Không tắt gate.
- npx eslint src: exit 1, **9 errors/4 warnings** ở baseline chưa sửa; [log](qa/reverification/lint-source.txt).
- Backend mvnw.cmd -B -DskipTests package: exit 0, 295 sources, MapStruct/deprecation warnings; tests bị skip và repository không có Java test sources. Không gọi đây là backend test PASS.
- git diff --check: exit 0. Backend git status sạch sau build/runtime. Không có npm test/type-check script được cấu hình cho dự án JS hiện tại.

Thiết kế chính xác chỉ có banner. Responsive auth/workspace là adaptation được mô tả, không có nguồn Figma tương ứng. Raster logo còn nền ảnh; chữ trong artwork nhỏ ở mobile. WebViewer vẫn có watermark PDFTron của demo license hiện có. Chưa thực hiện audit WCAG đầy đủ. Google login, AI/profile/bookmark/shared placeholders, dữ liệu recent tĩnh và contact form chưa có endpoint vẫn là giới hạn nghiệp vụ hiện có, không được coi là đã hoàn thiện chức năng.

## Điểm dừng và hành động tiếp theo

Frontend ở checkpoint build được, có bằng chứng UI mới và backend QA đang chạy với dữ liệu mẫu. Chưa nghiệm thu toàn ứng dụng. Bước tiếp theo là xác định quy tắc confidentiality cho hai luồng upload, thống nhất cách cung cấp UUID cho encrypted actions mà vẫn bảo toàn API hiện hữu, và cập nhật thương hiệu email backend. Sau khi các điểm backend này được xử lý đúng nghiệp vụ, chạy lại upload → preview → download/ZIP/watermark và các nhánh quyền chưa kiểm chứng. Không dùng seed để che lỗi upload hoặc đánh dấu toàn bộ end-to-end đã qua.
