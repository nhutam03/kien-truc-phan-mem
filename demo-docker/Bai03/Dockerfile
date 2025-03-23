# Sử dụng Node.js 18 Alpine làm base image
FROM node:18-alpine AS build

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ code vào container
COPY . .

# Build ứng dụng React
RUN npm run build

# Giai đoạn chạy server với Nginx
FROM nginx:stable-alpine

# Copy file build vào thư mục mặc định của Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose cổng 80
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
