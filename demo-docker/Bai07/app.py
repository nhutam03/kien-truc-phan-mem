import os

# Đọc biến môi trường APP_ENV
app_env = os.getenv("APP_ENV", "production")

# In ra màn hình
print(f"Ứng dụng đang chạy trong môi trường: {app_env}")
