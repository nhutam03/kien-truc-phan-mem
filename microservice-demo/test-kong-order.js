const axios = require('axios');

async function createOrder() {
  try {
    // Assuming Alice's customer ID is 4 (after creating with test-kong-customer.js)
    // and Smartphone product ID is 3 (after creating with test-kong-product.js)
    const response = await axios.post('http://localhost:8000/api/orders', {
      customerId: 4, // Alice Smith
      items: [
        {
          productId: 3, // Smartphone
          quantity: 1,
          price: 799.99
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('Order created:', response.data);
  } catch (error) {
    console.error('Error creating order:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

createOrder();
