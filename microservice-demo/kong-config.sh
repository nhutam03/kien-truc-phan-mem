#!/bin/bash

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
until curl -s http://localhost:8001/status > /dev/null; do
  sleep 1
done
echo "Kong is ready!"

# Create Product Service
echo "Creating Product Service..."
curl -s -X POST http://localhost:8001/services \
  --data name=product-service \
  --data url=http://product-service:3001

# Create Product Routes
echo "Creating Product Routes..."
curl -s -X POST http://localhost:8001/services/product-service/routes \
  --data name=product-routes \
  --data 'paths[]=/api/products' \
  --data 'paths[]=/api/products/.*'

# Create Customer Service
echo "Creating Customer Service..."
curl -s -X POST http://localhost:8001/services \
  --data name=customer-service \
  --data url=http://customer-service:3003

# Create Customer Routes
echo "Creating Customer Routes..."
curl -s -X POST http://localhost:8001/services/customer-service/routes \
  --data name=customer-routes \
  --data 'paths[]=/api/customers' \
  --data 'paths[]=/api/customers/.*'

# Create Order Service
echo "Creating Order Service..."
curl -s -X POST http://localhost:8001/services \
  --data name=order-service \
  --data url=http://order-service:3002

# Create Order Routes
echo "Creating Order Routes..."
curl -s -X POST http://localhost:8001/services/order-service/routes \
  --data name=order-routes \
  --data 'paths[]=/api/orders' \
  --data 'paths[]=/api/orders/.*'

# Enable Rate Limiting plugin globally
echo "Enabling Rate Limiting plugin..."
curl -s -X POST http://localhost:8001/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=local

# Enable Request Transformer plugin for all services
echo "Enabling Request Transformer plugin..."
curl -s -X POST http://localhost:8001/plugins \
  --data name=request-transformer \
  --data config.add.headers[]=Kong-Request-ID:$(uuidgen)

# Enable Cors plugin
echo "Enabling CORS plugin..."
curl -s -X POST http://localhost:8001/plugins \
  --data name=cors \
  --data config.origins=* \
  --data config.methods=GET,POST,PUT,DELETE \
  --data config.headers=Content-Type,Authorization \
  --data config.exposed_headers=X-Auth-Token \
  --data config.credentials=true \
  --data config.max_age=3600

echo "Kong configuration completed successfully!"
