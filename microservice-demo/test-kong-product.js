const axios = require('axios');

async function createProduct() {
  try {
    const response = await axios.post('http://localhost:8000/api/products', {
      name: 'Smartphone',
      price: 799.99,
      description: 'Latest smartphone with advanced features',
      stock: 50
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('Product created:', response.data);
  } catch (error) {
    console.error('Error creating product:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

createProduct();
