# Sử dụng Node.js phiên bản mới nhất
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Sao chép toàn bộ source code
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "server.js"]
