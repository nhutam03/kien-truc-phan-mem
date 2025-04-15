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
    new winston.transports.File({ filename: 'shipping-service.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8085;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/shipping-service';
const DISCOVERY_URL = process.env.DISCOVERY_URL || 'http://discovery-server-node:8761';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service-node:8082';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 5 minutes'
});

app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

// Shipment Schema
const shipmentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED'],
    default: 'PENDING'
  },
  shippingAddress: addressSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  estimatedDeliveryDate: { type: Date },
  actualDeliveryDate: { type: Date },
  carrierName: { type: String, required: true }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

// Circuit Breaker Options
const circuitBreakerOptions = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // After 30 seconds, try again
};

// Create a circuit breaker for order service
const orderCircuitBreaker = new CircuitBreaker(async (orderId, status) => {
  const response = await axios.put(`${ORDER_SERVICE_URL}/api/order/${orderId}/shipping-status`, null, {
    params: { status },
    timeout: 3000 // 3 second timeout
  });
  return response.data;
}, circuitBreakerOptions);

// Circuit breaker events
orderCircuitBreaker.on('open', () => logger.warn('Order circuit breaker opened'));
orderCircuitBreaker.on('close', () => logger.info('Order circuit breaker closed'));
orderCircuitBreaker.on('halfOpen', () => logger.info('Order circuit breaker half-open'));
orderCircuitBreaker.on('fallback', () => logger.warn('Order circuit breaker fallback called'));

// Register with Discovery Server
const registerWithDiscovery = async () => {
  const instanceId = uuidv4();
  const hostName = process.env.HOSTNAME || 'shipping-service-node';
  const ipAddr = '127.0.0.1'; // This would be dynamic in a real environment
  
  try {
    await axios.post(`${DISCOVERY_URL}/eureka/apps/SHIPPING-SERVICE`, {
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
        await axios.put(`${DISCOVERY_URL}/eureka/apps/SHIPPING-SERVICE/${instanceId}`);
        logger.debug('Heartbeat sent to Discovery Server');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error.message);
      }
    }, 30000);
    
    // Deregister on process exit
    process.on('SIGINT', async () => {
      try {
        await axios.delete(`${DISCOVERY_URL}/eureka/apps/SHIPPING-SERVICE/${instanceId}`);
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

// Helper function to generate tracking number
const generateTrackingNumber = () => {
  return 'TRK-' + uuidv4().substring(0, 8).toUpperCase();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// API Routes
app.post('/api/shipping', async (req, res) => {
  try {
    const { orderId, shippingAddress, carrierName } = req.body;
    
    if (!orderId || !shippingAddress || !carrierName) {
      return res.status(400).json({ message: 'OrderId, shippingAddress, and carrierName are required' });
    }
    
    // Generate tracking number
    const trackingNumber = generateTrackingNumber();
    
    // Calculate estimated delivery date (5 days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);
    
    // Create shipment
    const shipment = new Shipment({
      orderId,
      trackingNumber,
      status: 'PENDING',
      shippingAddress,
      estimatedDeliveryDate,
      carrierName
    });
    
    const savedShipment = await shipment.save();
    logger.info(`Shipment created for order: ${orderId}`);
    
    // Update order shipping status using circuit breaker
    try {
      await orderCircuitBreaker.fire(orderId, 'PENDING');
      logger.info(`Order shipping status updated for order: ${orderId}`);
    } catch (error) {
      logger.error(`Failed to update order shipping status for order: ${orderId}`, error);
      // We still return success since the shipment was created
    }
    
    res.status(201).json(savedShipment);
  } catch (error) {
    logger.error('Error creating shipment:', error);
    res.status(500).json({ message: 'Error creating shipment', error: error.message });
  }
});

app.put('/api/shipping/:shipmentId/status', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const { status, actualDeliveryDate } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const shipment = await Shipment.findById(shipmentId);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    shipment.status = status;
    shipment.updatedAt = new Date();
    
    if (status === 'DELIVERED' && actualDeliveryDate) {
      shipment.actualDeliveryDate = new Date(actualDeliveryDate);
    } else if (status === 'DELIVERED') {
      shipment.actualDeliveryDate = new Date();
    }
    
    await shipment.save();
    logger.info(`Shipment status updated to ${status} for shipment: ${shipmentId}`);
    
    // Update order shipping status using circuit breaker
    try {
      await orderCircuitBreaker.fire(shipment.orderId, status);
      logger.info(`Order shipping status updated for order: ${shipment.orderId}`);
    } catch (error) {
      logger.error(`Failed to update order shipping status for order: ${shipment.orderId}`, error);
      // We still return success since the shipment status was updated
    }
    
    res.status(200).json(shipment);
  } catch (error) {
    logger.error(`Error updating shipment status for shipment ${req.params.shipmentId}:`, error);
    res.status(500).json({ message: 'Error updating shipment status', error: error.message });
  }
});

app.get('/api/shipping/tracking/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const shipment = await Shipment.findOne({ trackingNumber });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    res.status(200).json(shipment);
  } catch (error) {
    logger.error(`Error fetching shipment by tracking number ${req.params.trackingNumber}:`, error);
    res.status(500).json({ message: 'Error fetching shipment', error: error.message });
  }
});

app.get('/api/shipping/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const shipments = await Shipment.find({ orderId });
    
    res.status(200).json(shipments);
  } catch (error) {
    logger.error(`Error fetching shipments for order ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Error fetching shipments', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Shipping Service running on port ${PORT}`);
  registerWithDiscovery();
});
