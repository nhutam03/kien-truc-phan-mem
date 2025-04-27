# Product Service với CI/CD Pipeline

Dự án này triển khai một Product Service đơn giản với CI/CD pipeline sử dụng GitHub Actions để triển khai lên Render.com.

## Cấu trúc dự án

- `index.js`: File ứng dụng chính chứa API Product Service
- `package.json`: Cấu hình package Node.js
- `Dockerfile`: Cấu hình Docker để containerization
- `.github/workflows/deploy.yml`: Cấu hình workflow GitHub Actions

## API Endpoints

- `GET /api/products`: Lấy danh sách tất cả sản phẩm
- `GET /api/products/:id`: Lấy thông tin sản phẩm theo ID
- `POST /api/products`: Tạo sản phẩm mới
- `PUT /api/products/:id`: Cập nhật thông tin sản phẩm
- `DELETE /api/products/:id`: Xóa sản phẩm

## CI/CD Pipeline

Pipeline CI/CD thực hiện các bước sau:

1. Build Docker image từ mã nguồn
2. Đẩy Docker image lên Docker Hub
3. Kích hoạt triển khai trên Render.com

## Hướng dẫn thiết lập

### Yêu cầu

- Tài khoản GitHub
- Tài khoản Docker Hub
- Tài khoản Render.com

### Thiết lập Docker Hub

1. Đăng ký tài khoản Docker Hub (nếu chưa có)
2. Tạo repository mới (ví dụ: "product-service")
3. Tạo access token:
   - Vào Settings > Security > Access Tokens
   - Tạo New Access Token
   - Lưu token này để sử dụng trong GitHub Secrets

### GitHub Secrets

Thêm các secrets sau vào repository GitHub của bạn:

- `DOCKERHUB_USERNAME`: Tên người dùng Docker Hub
- `DOCKERHUB_TOKEN`: Access token Docker Hub
- `RENDER_API_KEY`: API key của Render.com
- `RENDER_SERVICE_ID`: ID của service Render.com

### Thiết lập Render.com

1. Tạo Web Service mới trên Render.com
2. Chọn "Docker" làm môi trường
3. Kết nối repository GitHub của bạn
4. Cấu hình service để sử dụng Docker image từ Docker Hub
5. Thiết lập các biến môi trường:
   - `PORT`: 3000
   - `NODE_ENV`: production

## Phát triển cục bộ

```bash
# Cài đặt dependencies
npm install

# Khởi động ứng dụng
npm start
```

Ứng dụng sẽ khả dụng tại http://localhost:3000
