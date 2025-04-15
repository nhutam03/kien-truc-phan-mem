#!/bin/bash

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."

# Give Kong some time to start up first
sleep 30

# Then start checking
retry_count=0
max_retries=30

until curl -s http://kong:8001/status > /dev/null || [ $retry_count -eq $max_retries ]; do
  echo "Attempt $((retry_count+1))/$max_retries: Kong is not ready yet..."
  sleep 10
  retry_count=$((retry_count+1))
done

if [ $retry_count -eq $max_retries ]; then
  echo "Failed to connect to Kong after $max_retries attempts. Exiting."
  exit 1
fi

echo "Kong is ready!"

# Create services in Kong
echo "Creating services in Kong..."

# Product Service
curl -s -X POST http://kong:8001/services \
  --data name=product-service \
  --data url=http://product-service-node:8081

# Order Service
curl -s -X POST http://kong:8001/services \
  --data name=order-service \
  --data url=http://order-service-node:8082

# Inventory Service
curl -s -X POST http://kong:8001/services \
  --data name=inventory-service \
  --data url=http://inventory-service-node:8083

# Payment Service
curl -s -X POST http://kong:8001/services \
  --data name=payment-service \
  --data url=http://payment-service-node:8084

# Shipping Service
curl -s -X POST http://kong:8001/services \
  --data name=shipping-service \
  --data url=http://shipping-service-node:8085

echo "Services created successfully!"

# Create routes in Kong
echo "Creating routes in Kong..."

# Product Service Route
curl -s -X POST http://kong:8001/services/product-service/routes \
  --data name=product-route \
  --data paths=/api/product

# Order Service Route
curl -s -X POST http://kong:8001/services/order-service/routes \
  --data name=order-route \
  --data paths=/api/order

# Inventory Service Route
curl -s -X POST http://kong:8001/services/inventory-service/routes \
  --data name=inventory-route \
  --data paths=/api/inventory

# Payment Service Route
curl -s -X POST http://kong:8001/services/payment-service/routes \
  --data name=payment-route \
  --data paths=/api/payment

# Shipping Service Route
curl -s -X POST http://kong:8001/services/shipping-service/routes \
  --data name=shipping-route \
  --data paths=/api/shipping

echo "Routes created successfully!"

# Add rate limiting plugin to all services
echo "Adding rate limiting plugin to all services..."

# Product Service Rate Limiting
curl -s -X POST http://kong:8001/services/product-service/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=local

# Order Service Rate Limiting
curl -s -X POST http://kong:8001/services/order-service/plugins \
  --data name=rate-limiting \
  --data config.minute=50 \
  --data config.policy=local

# Inventory Service Rate Limiting
curl -s -X POST http://kong:8001/services/inventory-service/plugins \
  --data name=rate-limiting \
  --data config.minute=100 \
  --data config.policy=local

# Payment Service Rate Limiting
curl -s -X POST http://kong:8001/services/payment-service/plugins \
  --data name=rate-limiting \
  --data config.minute=20 \
  --data config.policy=local

# Shipping Service Rate Limiting
curl -s -X POST http://kong:8001/services/shipping-service/plugins \
  --data name=rate-limiting \
  --data config.minute=50 \
  --data config.policy=local

echo "Rate limiting plugins added successfully!"

# Add circuit breaker plugin to all services
echo "Adding circuit breaker plugin to all services..."

# Product Service Circuit Breaker
curl -s -X POST http://kong:8001/services/product-service/plugins \
  --data name=circuit-breaker \
  --data config.timeout=10000 \
  --data config.threshold=10 \
  --data config.window_size=60 \
  --data config.cb_status_codes=500,502,503,504

# Order Service Circuit Breaker
curl -s -X POST http://kong:8001/services/order-service/plugins \
  --data name=circuit-breaker \
  --data config.timeout=10000 \
  --data config.threshold=10 \
  --data config.window_size=60 \
  --data config.cb_status_codes=500,502,503,504

# Inventory Service Circuit Breaker
curl -s -X POST http://kong:8001/services/inventory-service/plugins \
  --data name=circuit-breaker \
  --data config.timeout=10000 \
  --data config.threshold=10 \
  --data config.window_size=60 \
  --data config.cb_status_codes=500,502,503,504

# Payment Service Circuit Breaker
curl -s -X POST http://kong:8001/services/payment-service/plugins \
  --data name=circuit-breaker \
  --data config.timeout=10000 \
  --data config.threshold=10 \
  --data config.window_size=60 \
  --data config.cb_status_codes=500,502,503,504

# Shipping Service Circuit Breaker
curl -s -X POST http://kong:8001/services/shipping-service/plugins \
  --data name=circuit-breaker \
  --data config.timeout=10000 \
  --data config.threshold=10 \
  --data config.window_size=60 \
  --data config.cb_status_codes=500,502,503,504

echo "Circuit breaker plugins added successfully!"

# Add response transformer plugin to all services
echo "Adding response transformer plugin to all services..."

curl -s -X POST http://kong:8001/plugins \
  --data name=response-transformer \
  --data config.add.headers=X-Kong-Gateway-Version:1.0

echo "Response transformer plugin added successfully!"

echo "Kong setup completed successfully!"
