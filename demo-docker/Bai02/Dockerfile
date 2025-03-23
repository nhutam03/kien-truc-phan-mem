# Sử dụng Python 3.9 làm base image
FROM python:3.9

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file requirements.txt vào container
COPY src/requirements.txt .

# Cài đặt dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ code vào container
COPY src/ .

# Expose cổng 5000
EXPOSE 5000

# Chạy ứng dụng khi container khởi động
CMD ["python", "app.py"]
