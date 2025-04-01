# Sử dụng image Python nhẹ
FROM python:3.9-slim

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file requirements.txt và cài đặt các thư viện cần thiết
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 5000 cho ứng dụng Flask
EXPOSE 5000

# Chạy ứng dụng
CMD ["python", "app.py"]
