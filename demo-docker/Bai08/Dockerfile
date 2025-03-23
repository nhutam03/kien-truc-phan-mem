# Sử dụng PostgreSQL phiên bản 15 làm base image
FROM postgres:15

# Thiết lập biến môi trường mặc định
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=mydatabase

# Sao chép file SQL vào thư mục khởi tạo của PostgreSQL
COPY init.sql /docker-entrypoint-initdb.d/

# Mở cổng PostgreSQL
EXPOSE 5432
