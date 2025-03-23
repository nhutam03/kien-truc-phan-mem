FROM node:18 AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json để cài đặt dependencies
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Stage 2: Dùng image nhẹ để chạy ứng dụng
FROM node:18-alpine AS runner

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file từ stage build sang stage chạy
COPY --from=builder /app/src/server.js ./server.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3001

# Chạy ứng dụng
CMD ["npm", "start"]
