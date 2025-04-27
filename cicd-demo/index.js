const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON body
app.use(express.json());

// Mảng lưu trữ sản phẩm (thay thế bằng database trong ứng dụng thực tế)
let products = [
  { id: 1, name: 'Laptop', price: 1200, description: 'Laptop cao cấp' },
  { id: 2, name: 'Smartphone', price: 800, description: 'Điện thoại thông minh' },
  { id: 3, name: 'Headphones', price: 100, description: 'Tai nghe không dây' }
];

// Route chính
app.get('/', (req, res) => {
  res.json({
    message: 'Product Service API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API lấy tất cả sản phẩm
app.get('/api/products', (req, res) => {
  res.json(products);
});

// API lấy sản phẩm theo ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }

  res.json(product);
});

// API tạo sản phẩm mới
app.post('/api/products', (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc' });
  }

  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    name,
    price,
    description: description || ''
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// API cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, description } = req.body;

  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }

  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price !== undefined ? price : products[productIndex].price,
    description: description !== undefined ? description : products[productIndex].description
  };

  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

// API xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  }

  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);

  res.json({ message: 'Đã xóa sản phẩm', product: deletedProduct });
});

app.listen(PORT, () => {
  console.log(`Product Service đang chạy trên cổng ${PORT}`);
});
