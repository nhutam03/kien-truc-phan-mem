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
    new winston.transports.File({ filename: 'payment-service.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 8084;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/payment-service';
const DISCOVERY_URL = process.env.DISCOVERY_URL || 'http://discovery-server-node:8761';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service-node:8082';

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 1 minute'
});

app.use('/api', apiLimiter);

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Payment Schema
const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER'],
    required: true
  },
  paymentDate: { type: Date, default: Date.now },
  transactionId: { type: String, required: true, unique: true }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

// Circuit Breaker Options
const circuitBreakerOptions = {
  timeout: 5000, // If our function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 30000 // After 30 seconds, try again
};

// Create a circuit breaker for order service
const orderCircuitBreaker = new CircuitBreaker(async (orderId, status) => {
  const response = await axios.put(`${ORDER_SERVICE_URL}/api/order/${orderId}/payment-status`, null, {
    params: { status },
    timeout: 3000 // 3 second timeout
  });
  return response.data;
}, circuitBreakerOptions);

// Create a test circuit breaker for visual demonstration
const testCircuitBreaker = new CircuitBreaker(async (shouldFail = false) => {
  if (shouldFail) {
    throw new Error('Simulated failure for circuit breaker test');
  }
  return { success: true, message: 'Operation succeeded' };
}, {
  ...circuitBreakerOptions,
  errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
  resetTimeout: 10000 // After 10 seconds, try again (shorter for testing)
});

// Circuit breaker events with logging
orderCircuitBreaker.on('open', () => logger.warn('Order circuit breaker opened'));
orderCircuitBreaker.on('close', () => logger.info('Order circuit breaker closed'));
orderCircuitBreaker.on('halfOpen', () => logger.info('Order circuit breaker half-open'));
orderCircuitBreaker.on('fallback', () => logger.warn('Order circuit breaker fallback called'));

// Test circuit breaker events with logging
testCircuitBreaker.on('open', () => logger.warn('TEST circuit breaker OPENED'));
testCircuitBreaker.on('close', () => logger.info('TEST circuit breaker CLOSED'));
testCircuitBreaker.on('halfOpen', () => logger.info('TEST circuit breaker HALF-OPEN'));
testCircuitBreaker.on('fallback', () => logger.warn('TEST circuit breaker fallback called'));

// Register with Discovery Server
const registerWithDiscovery = async () => {
  const instanceId = uuidv4();
  const hostName = process.env.HOSTNAME || 'payment-service-node';
  const ipAddr = '127.0.0.1'; // This would be dynamic in a real environment

  try {
    await axios.post(`${DISCOVERY_URL}/eureka/apps/PAYMENT-SERVICE`, {
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
        await axios.put(`${DISCOVERY_URL}/eureka/apps/PAYMENT-SERVICE/${instanceId}`);
        logger.debug('Heartbeat sent to Discovery Server');
      } catch (error) {
        logger.error('Failed to send heartbeat:', error.message);
      }
    }, 30000);

    // Deregister on process exit
    process.on('SIGINT', async () => {
      try {
        await axios.delete(`${DISCOVERY_URL}/eureka/apps/PAYMENT-SERVICE/${instanceId}`);
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
app.post('/api/payment/process', async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, cardNumber, cardHolderName, expiryDate, cvv } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'OrderId, amount, and paymentMethod are required' });
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate transaction ID
    const transactionId = uuidv4();

    // Create payment record
    const payment = new Payment({
      orderId,
      amount,
      status: 'COMPLETED', // Assume payment is successful
      paymentMethod,
      transactionId
    });

    const savedPayment = await payment.save();
    logger.info(`Payment processed successfully for order: ${orderId}`);

    // Update order payment status using circuit breaker
    try {
      await orderCircuitBreaker.fire(orderId, 'PAID');
      logger.info(`Order payment status updated for order: ${orderId}`);
    } catch (error) {
      logger.error(`Failed to update order payment status for order: ${orderId}`, error);
      // We still return success since the payment was processed
    }

    res.status(201).json(savedPayment);
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

app.post('/api/payment/:paymentId/refund', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot refund a payment that is not completed' });
    }

    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    payment.status = 'REFUNDED';
    await payment.save();

    // Update order payment status using circuit breaker
    try {
      await orderCircuitBreaker.fire(payment.orderId, 'REFUNDED');
      logger.info(`Order payment status updated for order: ${payment.orderId}`);
    } catch (error) {
      logger.error(`Failed to update order payment status for order: ${payment.orderId}`, error);
      // We still return success since the refund was processed
    }

    logger.info(`Payment refunded successfully for order: ${payment.orderId}`);

    res.status(200).json(payment);
  } catch (error) {
    logger.error(`Error refunding payment ${req.params.paymentId}:`, error);
    res.status(500).json({ message: 'Error refunding payment', error: error.message });
  }
});

app.get('/api/payment/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await Payment.find({ orderId });

    res.status(200).json(payments);
  } catch (error) {
    logger.error(`Error fetching payments for order ${req.params.orderId}:`, error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// Add endpoint that always fails for testing
app.post('/api/payment/test-failure', (req, res) => {
  res.status(500).json({ message: 'Simulated failure' });
});

let retryCount = 0;

app.post('/api/payment/test-retry', (req, res) => {
  retryCount++;
  if (retryCount <= 2) {
    res.status(500).json({ message: `Failure attempt ${retryCount}` });
  } else {
    retryCount = 0;
    res.json({ message: 'Success after retries' });
  }
});

app.get('/api/payment/test-timeout', async (req, res) => {
  // Simulate a slow response
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
  res.json({ message: 'Response after delay' });
});

// Circuit Breaker Visual Test Endpoints

// Get current circuit breaker state
app.get('/api/payment/circuit-breaker/status', (req, res) => {
  res.json({
    state: testCircuitBreaker.status,
    stats: {
      successes: testCircuitBreaker.stats.successes,
      failures: testCircuitBreaker.stats.failures,
      rejects: testCircuitBreaker.stats.rejects,
      timeouts: testCircuitBreaker.stats.timeouts
    },
    options: {
      errorThresholdPercentage: testCircuitBreaker.options.errorThresholdPercentage,
      resetTimeout: testCircuitBreaker.options.resetTimeout
    }
  });
});

// Test endpoint that can be controlled to succeed or fail
app.post('/api/payment/circuit-breaker/test', async (req, res) => {
  const shouldFail = req.body.shouldFail === true;

  try {
    const result = await testCircuitBreaker.fire(shouldFail);
    res.json({
      result,
      circuitState: testCircuitBreaker.status,
      stats: {
        successes: testCircuitBreaker.stats.successes,
        failures: testCircuitBreaker.stats.failures,
        rejects: testCircuitBreaker.stats.rejects
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      circuitState: testCircuitBreaker.status,
      stats: {
        successes: testCircuitBreaker.stats.successes,
        failures: testCircuitBreaker.stats.failures,
        rejects: testCircuitBreaker.stats.rejects
      }
    });
  }
});

// Reset circuit breaker stats
app.post('/api/payment/circuit-breaker/reset', (req, res) => {
  testCircuitBreaker.stats.reset();
  res.json({
    message: 'Circuit breaker stats reset',
    state: testCircuitBreaker.status,
    stats: {
      successes: testCircuitBreaker.stats.successes,
      failures: testCircuitBreaker.stats.failures,
      rejects: testCircuitBreaker.stats.rejects
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Payment Service running on port ${PORT}`);
  registerWithDiscovery();
});



