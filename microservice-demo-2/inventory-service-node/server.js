const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const winston = require('winston');
const CircuitBreaker = require('opossum');
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
    new winston.transports.File({ filename: 'inventory-service.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8083;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/inventory-service';
const DISCOVERY_URL = process.env.DISCOVERY_URL || 'http://discovery-server-node:8761';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Inventory Schema
const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

// Circuit Breaker Options
const circuitBreakerOptions = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 10000 // After 10 seconds, try again
};

// Register with Discovery Server
const registerWithDiscovery = async () => {
  const instanceId = uuidv4();
  const hostName = process.env.HOSTNAME || 'inventory-service-node';
  const ipAddr = '127.0.0.1'; // This would be dynamic in a real environment
  
  try {
    await axios.post(`${DISCOVERY_URL}/eureka/apps/INVENTORY-SERVICE`, {
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
        await axios.put(`${DISCOVERY_URL}/eureka/apps/INVENTORY-SERVICE/${instanceId}`);
        logger.debug('Heartbeat sent to Discovery Server');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error.message);
      }
    }, 30000);
    
    // Deregister on process exit
    process.on('SIGINT', async () => {
      try {
        await axios.delete(`${DISCOVERY_URL}/eureka/apps/INVENTORY-SERVICE/${instanceId}`);
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
app.get('/api/inventory', async (req, res) => {
  try {
    const { productIds } = req.query;
    
    if (!productIds) {
      const inventories = await Inventory.find();
      return res.status(200).json(inventories);
    }
    
    // Simulate slow response to test circuit breaker
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const productIdArray = productIds.split(',');
    const inventories = await Inventory.find({ productId: { $in: productIdArray } });
    
    const response = productIdArray.map(productId => {
      const inventoryItem = inventories.find(item => item.productId === productId);
      return {
        productId,
        isInStock: inventoryItem ? inventoryItem.quantity > 0 : false
      };
    });
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Error checking inventory:', error);
    res.status(500).json({ message: 'Error checking inventory', error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'ProductId and quantity are required' });
    }
    
    let inventory = await Inventory.findOne({ productId });
    
    if (inventory) {
      inventory.quantity = quantity;
      await inventory.save();
      logger.info(`Inventory updated for product: ${productId}`);
    } else {
      inventory = new Inventory({ productId, quantity });
      await inventory.save();
      logger.info(`Inventory created for product: ${productId}`);
    }
    
    res.status(200).json(inventory);
  } catch (error) {
    logger.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
});

app.put('/api/inventory/:productId/reduce', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.query;
    
    if (!quantity || isNaN(quantity)) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    
    const inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Product not found in inventory' });
    }
    
    if (inventory.quantity < parseInt(quantity)) {
      return res.status(400).json({ message: `Insufficient stock for product: ${productId}` });
    }
    
    inventory.quantity -= parseInt(quantity);
    await inventory.save();
    
    logger.info(`Reduced quantity for product: ${productId}`);
    res.status(200).json(inventory);
  } catch (error) {
    logger.error(`Error reducing inventory for product ${req.params.productId}:`, error);
    res.status(500).json({ message: 'Error reducing inventory', error: error.message });
  }
});

// Create a circuit breaker for the inventory check
const checkStockBreaker = new CircuitBreaker(async (productIds) => {
  const inventories = await Inventory.find({ productId: { $in: productIds } });
  
  return productIds.map(productId => {
    const inventoryItem = inventories.find(item => item.productId === productId);
    return {
      productId,
      isInStock: inventoryItem ? inventoryItem.quantity > 0 : false
    };
  });
}, circuitBreakerOptions);

// Circuit breaker events
checkStockBreaker.on('open', () => logger.warn('Circuit breaker opened'));
checkStockBreaker.on('close', () => logger.info('Circuit breaker closed'));
checkStockBreaker.on('halfOpen', () => logger.info('Circuit breaker half-open'));
checkStockBreaker.on('fallback', () => logger.warn('Circuit breaker fallback called'));

// Circuit breaker endpoint
app.get('/api/inventory/circuit-breaker', async (req, res) => {
  try {
    const { productIds } = req.query;
    
    if (!productIds) {
      return res.status(400).json({ message: 'ProductIds are required' });
    }
    
    const productIdArray = productIds.split(',');
    
    // Use the circuit breaker
    const result = await checkStockBreaker.fire(productIdArray).catch(error => {
      logger.error('Circuit breaker error:', error);
      // Fallback response when circuit is open
      return productIdArray.map(productId => ({
        productId,
        isInStock: false,
        fallback: true
      }));
    });
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in circuit breaker endpoint:', error);
    res.status(500).json({ message: 'Error checking inventory', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Inventory Service running on port ${PORT}`);
  registerWithDiscovery();
});
