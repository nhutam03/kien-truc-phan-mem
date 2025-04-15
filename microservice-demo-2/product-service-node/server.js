const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const winston = require('winston');
require('dotenv').config();

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'product-service.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8081;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/product-service';
const DISCOVERY_URL = process.env.DISCOVERY_URL || 'http://discovery-server-node:8761';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Register with Discovery Server
const registerWithDiscovery = async () => {
  const instanceId = uuidv4();
  const hostName = process.env.HOSTNAME || 'product-service-node';
  const ipAddr = '127.0.0.1'; // This would be dynamic in a real environment
  
  try {
    await axios.post(`${DISCOVERY_URL}/eureka/apps/PRODUCT-SERVICE`, {
      instanceId,
      hostName,
      ipAddr,
      port: PORT,
      status: 'UP'
    });
    
    logger.info('Registered with Discovery Server');
    
    // Send heartbeat every 30 seconds
    setInterval(async () => {
      try {
        await axios.put(`${DISCOVERY_URL}/eureka/apps/PRODUCT-SERVICE/${instanceId}`);
        logger.debug('Heartbeat sent to Discovery Server');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error.message);
      }
    }, 30000);
    
    // Deregister on process exit
    process.on('SIGINT', async () => {
      try {
        await axios.delete(`${DISCOVERY_URL}/eureka/apps/PRODUCT-SERVICE/${instanceId}`);
        logger.info('Deregistered from Discovery Server');
        process.exit(0);
      } catch (error) {
        logger.error('Failed to deregister:', error.message);
        process.exit(1);
      }
    });
    
  } catch (error) {
    logger.error('Failed to register with Discovery Server:', error.message);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// API Routes
app.get('/api/product', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    logger.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

app.post('/api/product', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Name, description, and price are required' });
    }
    
    const product = new Product({
      name,
      description,
      price
    });
    
    const savedProduct = await product.save();
    logger.info(`Product created: ${savedProduct._id}`);
    res.status(201).json(savedProduct);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

app.put('/api/product/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    logger.info(`Product updated: ${updatedProduct._id}`);
    res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error(`Error updating product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

app.delete('/api/product/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    logger.info(`Product deleted: ${req.params.id}`);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
  registerWithDiscovery();
});
