# Sử dụng node:18 làm base image
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ code vào container
COPY . .

# Expose cổng 3000
EXPOSE 3000

# Chạy ứng dụng khi container khởi động
CMD ["npm", "start"]
