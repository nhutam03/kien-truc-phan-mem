# Sử dụng Redis phiên bản mới nhất làm base image
FROM redis:latest

# Sao chép tệp cấu hình vào container
COPY redis.conf /usr/local/etc/redis/redis.conf

# Mở cổng mặc định của Redis
EXPOSE 6379

# Chạy Redis với tệp cấu hình tùy chỉnh
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
