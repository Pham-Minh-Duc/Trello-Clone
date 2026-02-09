# 📝 Trello Clone App (Mini Version)

Một ứng dụng quản lý công việc (Trello Clone) đơn giản được xây dựng với kiến trúc MERN Stack, cho phép người dùng tạo bảng công việc, mời thành viên tham gia vào từng thẻ (Card) cụ thể và quản lý theo trạng thái.

## 🚀 Tính năng nổi bật
- **Quản lý Bảng (Board):** Hiển thị danh sách bảng mà người dùng sở hữu hoặc tham gia.
- **Kéo thả (Drag & Drop):** Sắp xếp thẻ công việc linh hoạt giữa các cột (To Do, In Progress, Done).
- **Mời thành viên (Invitation):** Hệ thống mời thành viên vào từng Card cụ thể qua Email.
- **Phân quyền:** Chỉ hiển thị Board nếu người dùng là chủ sở hữu hoặc có mặt trong `list_member` của Card.

## 📂 Cấu trúc dự án
Dự án được chia làm 2 phần chính:
- **`backend/`**: Node.js, Express, Firebase Admin SDK (Firestore).
- **`frontend/`**: React.js, Vite, Tailwind CSS, Hello Pangea DND.

## 🛠️ Hướng dẫn cài đặt và Chạy ứng dụng

### 1. Yêu cầu hệ thống
- Node.js (v16+)
- Tài khoản Firebase (Firestore)

### 2. Cấu trúc Backend
1. Truy cập thư mục backend: `cd backend`
2. Cài đặt thư viện: `npm install`
3. Cấu hình file `backend/src/config/firebase-key.json` (Vui lòng không push file này lên GitHub).
4. Chạy server: `npm start` (Mặc định chạy tại port 5000).

### 3. Cấu trúc Frontend
1. Truy cập thư mục frontend: `cd frontend`
2. Cài đặt thư viện: `npm install`
3. Chạy ứng dụng: `npm run dev` (Mặc định chạy tại `http://localhost:5173`).

## 📸 Hình ảnh minh họa
![Trang chủ](screenshots/home.png)
![Chi tiết thẻ](screenshots/card-detail.png)
