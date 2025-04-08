const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;

// Service URLs
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Welcome route
app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Product Service Routes
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${productServiceUrl}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Product Service unavailable', details: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.get(`${productServiceUrl}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Product Service unavailable' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const response = await axios.post(`${productServiceUrl}/products`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Product Service unavailable' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.put(`${productServiceUrl}/products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Product Service unavailable' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${productServiceUrl}/products/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Product Service unavailable' });
  }
});

// Order Service Routes
app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${orderServiceUrl}/orders`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Order Service unavailable', details: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const response = await axios.get(`${orderServiceUrl}/orders/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Order Service unavailable' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${orderServiceUrl}/orders`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Order Service unavailable' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const response = await axios.put(`${orderServiceUrl}/orders/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating order:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Order Service unavailable' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${orderServiceUrl}/orders/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting order:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Order Service unavailable' });
  }
});

// Customer Service Routes
app.get('/api/customers', async (req, res) => {
  try {
    const response = await axios.get(`${customerServiceUrl}/customers`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ error: 'Customer Service unavailable', details: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const response = await axios.get(`${customerServiceUrl}/customers/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching customer:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Customer Service unavailable' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    console.log('Received request to create customer:', req.body);
    const response = await axios.post(`${customerServiceUrl}/customers`, req.body, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Customer created successfully:', response.data);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating customer:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Customer Service unavailable', details: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const response = await axios.put(`${customerServiceUrl}/customers/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating customer:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Customer Service unavailable' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${customerServiceUrl}/customers/${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting customer:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Customer Service unavailable' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`Product Service URL: ${productServiceUrl}`);
  console.log(`Order Service URL: ${orderServiceUrl}`);
  console.log(`Customer Service URL: ${customerServiceUrl}`);
});
