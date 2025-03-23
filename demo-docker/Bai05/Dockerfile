# Bước 1: Dùng Golang để build ứng dụng
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng bên trong Docker (không cần cài Go trên máy)
RUN go mod init myapp && go mod tidy && go build -o myapp

# Bước 2: Dùng Alpine Linux để chạy ứng dụng nhỏ gọn
FROM alpine:latest

WORKDIR /root/

# Copy file từ builder vào image final
COPY --from=builder /app/myapp .

# Cấp quyền thực thi cho file myapp
RUN chmod +x myapp

# Mở cổng 8080
EXPOSE 8080

# Chạy ứng dụng khi container khởi động
CMD ["./myapp"]
