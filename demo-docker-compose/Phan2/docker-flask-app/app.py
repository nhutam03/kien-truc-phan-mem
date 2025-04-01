from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Flask in Docker!"

if __name__ == '__main__':
    # Lắng nghe trên tất cả các địa chỉ IP trong container
    app.run(host='0.0.0.0', port=5000, debug=True)
