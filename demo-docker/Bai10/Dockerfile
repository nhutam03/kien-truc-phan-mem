# Sử dụng PHP 8.2 với Apache
FROM php:8.2-apache

# Cài đặt các phần mở rộng cần thiết (nếu có)
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Mở cổng HTTP (80)
EXPOSE 80
