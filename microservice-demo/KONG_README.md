# Kong API Gateway Integration

This document provides instructions for using Kong API Gateway with our microservice architecture.

## Overview

We've integrated Kong API Gateway to manage and route API requests to our microservices. Kong provides:

- API routing and load balancing
- Authentication and authorization
- Rate limiting
- Request/response transformation
- Logging and monitoring
- And many more features through plugins

## Architecture

```
Client → Kong API Gateway → Microservices (Product, Customer, Order)
```

Kong is configured to route requests based on the path:
- `/api/products/*` → Product Service
- `/api/customers/*` → Customer Service
- `/api/orders/*` → Order Service

## Getting Started

### 1. Start the Services

```bash
docker-compose up -d
```

This will start all services including:
- Kong API Gateway (port 8000)
- Kong Admin API (port 8001)
- Konga - Kong Admin UI (port 1337)
- All microservices and their databases

### 2. Configure Kong

After all services are up, run the configuration script:

```bash
chmod +x kong-config.sh
./kong-config.sh
```

This script will:
- Create services in Kong for each microservice
- Create routes to direct traffic to the appropriate service
- Enable plugins for rate limiting, CORS, and request transformation

### 3. Access Konga (Kong Admin UI)

1. Open http://localhost:1337 in your browser
2. Create an admin account on first login
3. Connect to Kong Admin API:
   - Name: default
   - Kong Admin URL: http://kong:8001

### 4. Test the API Gateway

Use the provided test scripts:

```bash
# Create a customer through Kong
node test-kong-customer.js

# Create a product through Kong
node test-kong-product.js

# Create an order through Kong
node test-kong-order.js
```

## API Endpoints

All API requests should now go through Kong at `http://localhost:8000`:

### Product Service
- GET `/api/products` - List all products
- GET `/api/products/:id` - Get a specific product
- POST `/api/products` - Create a new product
- PUT `/api/products/:id` - Update a product
- DELETE `/api/products/:id` - Delete a product

### Customer Service
- GET `/api/customers` - List all customers
- GET `/api/customers/:id` - Get a specific customer
- POST `/api/customers` - Create a new customer
- PUT `/api/customers/:id` - Update a customer
- DELETE `/api/customers/:id` - Delete a customer

### Order Service
- GET `/api/orders` - List all orders
- GET `/api/orders/:id` - Get a specific order
- POST `/api/orders` - Create a new order
- PUT `/api/orders/:id` - Update an order
- DELETE `/api/orders/:id` - Delete an order

## Kong Plugins Enabled

1. **Rate Limiting**: Limits requests to 100 per minute
2. **Request Transformer**: Adds a unique request ID header
3. **CORS**: Enables Cross-Origin Resource Sharing

## Troubleshooting

### Kong is not routing requests correctly

Check the Kong logs:
```bash
docker logs microservice-demo-kong-1
```

### View Kong configuration

List all services:
```bash
curl http://localhost:8001/services
```

List all routes:
```bash
curl http://localhost:8001/routes
```

List all plugins:
```bash
curl http://localhost:8001/plugins
```

### Reset Kong configuration

To reset Kong configuration, you can use Konga UI or run:
```bash
# Delete all routes
curl -X GET http://localhost:8001/routes | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://localhost:8001/routes/{}

# Delete all services
curl -X GET http://localhost:8001/services | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://localhost:8001/services/{}

# Delete all plugins
curl -X GET http://localhost:8001/plugins | jq -r '.data[].id' | xargs -I {} curl -X DELETE http://localhost:8001/plugins/{}
```

Then run the configuration script again:
```bash
./kong-config.sh
```
