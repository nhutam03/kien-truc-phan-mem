const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const winston = require('winston');
const CircuitBreaker = require('opossum');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configure axios retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status >= 500;
  }
});

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'order-service.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8082;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/order-service';
const DISCOVERY_URL = process.env.DISCOVERY_URL || 'http://discovery-server-node:8761';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service-node:8083';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service-node:8084';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Order Schema
const orderLineItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  orderLineItems: [orderLineItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['CREATED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  shippingStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED'],
    default: 'PENDING'
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Circuit Breaker Options
const circuitBreakerOptions = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // After 30 seconds, try again
};

// Create a circuit breaker for inventory check
const inventoryCircuitBreaker = new CircuitBreaker(async (productIds) => {
  const response = await axios.get(`${INVENTORY_SERVICE_URL}/api/inventory`, {
    params: { productIds: productIds.join(',') },
    timeout: 3000 // 3 second timeout
  });
  return response.data;
}, circuitBreakerOptions);

// Circuit breaker events
inventoryCircuitBreaker.on('open', () => logger.warn('Inventory circuit breaker opened'));
inventoryCircuitBreaker.on('close', () => logger.info('Inventory circuit breaker closed'));
inventoryCircuitBreaker.on('halfOpen', () => logger.info('Inventory circuit breaker half-open'));
inventoryCircuitBreaker.on('fallback', () => logger.warn('Inventory circuit breaker fallback called'));

// Register with Discovery Server
const registerWithDiscovery = async () => {
  const instanceId = uuidv4();
  const hostName = process.env.HOSTNAME || 'order-service-node';
  const ipAddr = '127.0.0.1'; // This would be dynamic in a real environment
  
  try {
    await axios.post(`${DISCOVERY_URL}/eureka/apps/ORDER-SERVICE`, {
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
        await axios.put(`${DISCOVERY_URL}/eureka/apps/ORDER-SERVICE/${instanceId}`);
        logger.debug('Heartbeat sent to Discovery Server');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error.message);
      }
    }, 30000);
    
    // Deregister on process exit
    process.on('SIGINT', async () => {
      try {
        await axios.delete(`${DISCOVERY_URL}/eureka/apps/ORDER-SERVICE/${instanceId}`);
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
app.get('/api/order', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.get('/api/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    logger.error(`Error fetching order ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { customerId, orderLineItems } = req.body;
    
    if (!customerId || !orderLineItems || !Array.isArray(orderLineItems) || orderLineItems.length === 0) {
      return res.status(400).json({ message: 'CustomerId and orderLineItems are required' });
    }
    
    // Extract product IDs for inventory check
    const productIds = orderLineItems.map(item => item.productId);
    
    // Check inventory using circuit breaker
    let inventoryResponse;
    try {
      inventoryResponse = await inventoryCircuitBreaker.fire(productIds);
    } catch (error) {
      logger.error('Inventory check failed:', error);
      return res.status(503).json({ message: 'Inventory service unavailable, please try again later' });
    }
    
    // Check if all products are in stock
    const allProductsInStock = inventoryResponse.every(item => item.isInStock);
    
    if (!allProductsInStock) {
      return res.status(400).json({ message: 'Some products are not in stock' });
    }
    
    // Calculate total amount
    const totalAmount = orderLineItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Create order
    const order = new Order({
      customerId,
      orderLineItems,
      totalAmount,
      status: 'CREATED',
      paymentStatus: 'PENDING',
      shippingStatus: 'PENDING'
    });
    
    const savedOrder = await order.save();
    logger.info(`Order created: ${savedOrder._id}`);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Update payment status
app.put('/api/order/:orderId/payment-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.paymentStatus = status;
    
    // If payment is completed, update order status to PROCESSING
    if (status === 'PAID') {
      order.status = 'PROCESSING';
    }
    
    // If payment is refunded, update order status to CANCELLED
    if (status === 'REFUNDED') {
      order.status = 'CANCELLED';
    }
    
    await order.save();
    logger.info(`Payment status updated to ${status} for order: ${orderId}`);
    
    res.status(200).json(order);
  } catch (error) {
    logger.error(`Error updating payment status for order ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Update shipping status
app.put('/api/order/:orderId/shipping-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.shippingStatus = status;
    
    // If shipping is delivered, update order status to COMPLETED
    if (status === 'DELIVERED') {
      order.status = 'COMPLETED';
    }
    
    await order.save();
    logger.info(`Shipping status updated to ${status} for order: ${orderId}`);
    
    res.status(200).json(order);
  } catch (error) {
    logger.error(`Error updating shipping status for order ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Error updating shipping status', error: error.message });
  }
});

// Add new endpoint to test circuit breaker
app.post('/api/test/circuit-breaker', async (req, res) => {
  const paymentCircuitBreaker = new CircuitBreaker(async () => {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/api/payment/test-failure`);
    return response.data;
  }, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000
  });

  try {
    // Make 3 calls to trigger circuit breaker
    for(let i = 0; i < 3; i++) {
      try {
        await paymentCircuitBreaker.fire();
      } catch (error) {
        logger.error(`Call ${i + 1} failed: ${error.message}`);
      }
    }

    // This call should trigger circuit breaker
    await paymentCircuitBreaker.fire();
    
    res.json({ message: 'Circuit breaker test completed' });
  } catch (error) {
    if (error.message.includes('Circuit breaker is open')) {
      res.status(503).json({ 
        message: 'Circuit breaker is open',
        status: 'Success - Circuit Breaker working as expected'
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Add new endpoint to test retry
app.post('/api/test/retry', async (req, res) => {
  try {
    // Configure axios retry specifically for this test
    const axiosWithRetry = axios.create();
    axiosRetry(axiosWithRetry, { 
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response.status >= 500;
      },
      onRetry: (retryCount, error) => {
        logger.info(`Retry attempt ${retryCount} due to ${error.message}`);
      }
    });

    const response = await axiosWithRetry.post(`${PAYMENT_SERVICE_URL}/api/payment/test-retry`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: 'All retry attempts failed',
      retryCount: error.config.retryCount || 0
    });
  }
});

// Configure strict rate limit for testing
const testRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: 'Too many requests, please try again later'
});

app.post('/api/test/rate-limit', testRateLimiter, async (req, res) => {
  try {
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/api/payment/test-rate-limit`);
    res.json(response.data);
  } catch (error) {
    res.status(429).json({ message: error.message });
  }
});

app.post('/api/test/timeout', async (req, res) => {
  try {
    // Set a very short timeout
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/api/payment/test-timeout`, {
      timeout: 2000 // 2 seconds timeout
    });
    res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({ 
        message: 'Request timeout',
        status: 'Success - Timeout working as expected'
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Order Service running on port ${PORT}`);
  registerWithDiscovery();
});




