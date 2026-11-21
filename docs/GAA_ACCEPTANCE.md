# GAA — nhận source và tiếp tục nghiệm thu

Trạng thái tích hợp LOCAL đã hoàn tất. Nghiệm thu toàn trình bằng `qwen2.5:7b` và thiết bị thật vẫn **PENDING_TEAM_EXECUTION**. Nhánh bàn giao là `feature/gaa-integration` ở cả hai repo; `main` không tự nhận các thay đổi này.

## Clone đúng hai nhánh

```powershell
git clone --branch feature/gaa-integration https://github.com/HoangKhang5207/dms-backend.git
git clone --branch feature/gaa-integration https://github.com/HoangKhang5207/dms-frontend.git
```

Đặt hai thư mục cạnh nhau để thuận tiện cho QA. Git worktree chỉ là cách làm việc cục bộ của người tích hợp; clone mới không cần `.worktrees`, runtime, node_modules hoặc khóa của máy cũ.

## Cài và chạy frontend

Vite trong lockfile yêu cầu Node `^20.19.0 || >=22.12.0`; máy xác minh dùng Node24.16.0. Script postinstall hiện có dùng `xcopy`, vì vậy hướng dẫn này áp dụng Windows. Không thay đổi postinstall trong đợt đóng gói.

```powershell
npm ci
npm run build
$env:VITE_GAA_ENABLED='true'
npm run dev -- --host 127.0.0.1 --port 5175 --strictPort
```

`VITE_GAA_ENABLED` mặc định tắt; `.env.example` chỉ chứa thiết lập công khai cho trình duyệt. Không đưa secret vào biến `VITE_*`. Dùng cơ chế auth/Axios hiện có; không thay URL toàn ứng dụng để mở đường ra ngoài cho mô hình.

## Backend và phần còn lại

Runbook đầy đủ nằm ngay trong source backend: `agent-service/docs/acceptance/TEAM_ACCEPTANCE.md`. Bắt đầu từ cài Python3.11/JDK21, kiểm fixture manifest và preflight; tạo credential/khóa riêng cho clone mới. Không sao chép `.runtime.local` của máy cũ hoặc chạy seed mới đè checkpoint cũ.

Giữ đúng mô hình nội bộ7B, budget60s/model và180s/request, sandbox10s/1GiB, network-none/Landlock. Trên kernel/image mới phải chạy lại ba OS attempt riêng. Máy cũ có42 vị trí K,12PASS/30BLOCKED; không sử dụng số đó làm kết quả nghiệm thu máy mới.

Các nhóm cần hoàn tất:30 lượt model chưa chạy, HS10/injection thực, K7/Critic sửa lỗi, TC13–18 và N4, bảng/biểu đồ/chú giải/tooltip thật, CSV/XLSX/PNG từ accepted result và kiểm owner/quyền/TTL, người kiểm có tên và thiết bị thực.

## Kiểm tra UI có sẵn

```powershell
node --test src/pages/Home/AgentAnalysis/agentResults.test.js
```

Kiểm đúng vị trí tệp test trong source nếu shell không mở rộng wildcard. Các helper được giữ trong `scripts/qa/`: `gaa-browser.cjs` kiểm fixture UI; `gaa-live.cjs` kiểm luồng thật sau readiness; `gaa-docker-bridge.cjs` là cầu nối stdio cố định đến DMS của môi trường cô lập. Xem cách gọi và các biến cần thiết trong runbook backend. Response mô phỏng và video headless không thay thế nghiệm thu mô hình/thiết bị thật.

Full lint có baseline9 lỗi/4 cảnh báo tại checkpoint; targeted lint GAA sạch. Không xóa test hoặc tắt rule để làm xanh. Feature-branch publication không phải quyền merge/deploy hoặc chứng nhận production.
