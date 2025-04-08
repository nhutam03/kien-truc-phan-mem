const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON payload size limit and timeout
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set timeout for all requests
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request Timeout');
  });
  next();
});

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/order_db', {
  dialect: 'postgres',
  logging: false,
  retry: {
    max: 10,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /Connection terminated unexpectedly/
    ],
    backoffBase: 1000,
    backoffExponent: 1.5,
  }
});

// Order model
const Order = sequelize.define('Order', {
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  }
});

// Order Item model
const OrderItem = sequelize.define('OrderItem', {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

// Relationships
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Function to connect to the database with retries
const connectWithRetry = async () => {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully');

      // Sync database
      await sequelize.sync({ force: false });
      console.log('Database synchronized');
      return;
    } catch (err) {
      console.error('Unable to connect to the database:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Connect to the database
connectWithRetry();

// Service URLs
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003';

// Routes
app.get('/', (req, res) => {
  res.send('Order Service is running');
});

// Get all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [OrderItem]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
app.post('/orders', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customerId, items } = req.body;

    // Validate customer exists
    try {
      await axios.get(`${customerServiceUrl}/customers/${customerId}`);
    } catch (error) {
      await t.rollback();
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate total amount and validate products
    let totalAmount = 0;
    for (const item of items) {
      try {
        const productResponse = await axios.get(`${productServiceUrl}/products/${item.productId}`);
        const product = productResponse.data;

        if (product.stock < item.quantity) {
          await t.rollback();
          return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
        }

        totalAmount += product.price * item.quantity;

        // Update product stock
        await axios.put(`${productServiceUrl}/products/${item.productId}`, {
          ...product,
          stock: product.stock - item.quantity
        });
      } catch (error) {
        await t.rollback();
        return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
      }
    }

    // Create order
    const order = await Order.create({
      customerId,
      totalAmount,
      status: 'pending'
    }, { transaction: t });

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });
    }

    await t.commit();

    // Fetch the complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [OrderItem]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await t.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
app.delete('/orders/:id', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem]
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    // If order is completed, we can't delete it
    if (order.status === 'completed') {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot delete a completed order' });
    }

    // If order is pending, restore product stock
    if (order.status === 'pending') {
      for (const item of order.OrderItems) {
        try {
          const productResponse = await axios.get(`${productServiceUrl}/products/${item.productId}`);
          const product = productResponse.data;

          await axios.put(`${productServiceUrl}/products/${item.productId}`, {
            ...product,
            stock: product.stock + item.quantity
          });
        } catch (error) {
          console.error(`Error restoring stock for product ${item.productId}:`, error);
          // Continue with deletion even if stock restoration fails
        }
      }
    }

    // Delete order items
    await OrderItem.destroy({
      where: { orderId: order.id },
      transaction: t
    });

    // Delete order
    await order.destroy({ transaction: t });

    await t.commit();
    res.status(204).end();
  } catch (error) {
    await t.rollback();
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Order Service running on port ${port}`);
});
