# Sử dụng image Python mới nhất
FROM python:3.9

# Thiết lập biến môi trường mặc định
ENV APP_ENV=development

# Sao chép file script vào container
COPY app.py /app/app.py

# Đặt thư mục làm việc
WORKDIR /app

# Chạy script khi container khởi động
CMD ["python", "app.py"]
