const axios = require('axios');

async function createCustomer() {
  try {
    const response = await axios.post('http://localhost:8000/api/customers', {
      name: 'Alice Smith',
      email: 'alice@example.com',
      phone: '555-987-6543',
      address: '123 Elm Street'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('Customer created:', response.data);
  } catch (error) {
    console.error('Error creating customer:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

createCustomer();
