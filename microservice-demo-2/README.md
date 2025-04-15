# Microservice Demo

This project demonstrates a microservice architecture for an e-commerce application with fault tolerance patterns.

## Services

- **Discovery Server**: Simple service registry implemented in Node.js
- **Kong Gateway**: API Gateway for routing and managing requests
- **Product Service**: Manages product information (Node.js)
- **Order Service**: Handles order processing (Node.js)
- **Inventory Service**: Manages product stock (Node.js)
- **Payment Service**: Processes payments (Node.js)
- **Shipping Service**: Handles shipping logistics (Node.js)

## Fault Tolerance Patterns

The following fault tolerance patterns are implemented:

### In Microservices (using Node.js libraries):
- **Circuit Breaker**: Prevents cascading failures by stopping calls to failing services (opossum)
- **Retry**: Automatically retries failed operations (axios-retry)
- **Rate Limiter**: Limits the number of calls to a service (express-rate-limit)
- **Time Limiter**: Sets a timeout for service calls (axios timeout)

### In Kong Gateway:
- **Circuit Breaker**: Prevents cascading failures by stopping calls to failing services
- **Rate Limiting**: Limits the number of calls to a service
- **Response Transformation**: Modifies response headers

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose

## Building the Application

No build step is required for Node.js services. Docker Compose will install dependencies during container build.

## Running the Application

### Using Docker Compose

To start all services using Docker Compose, run:

```bash
docker-compose up -d
```

If you encounter any issues, you can try rebuilding the images:

```bash
docker-compose build --no-cache
docker-compose up -d
```

To stop all services:

```bash
docker-compose down
```

To view logs for a specific service:

```bash
docker-compose logs -f <service-name>
```

For example:
```bash
docker-compose logs -f kong
```

### Accessing the Services

- **Discovery Server**: http://localhost:8761
- **Kong Gateway**: http://localhost:8000
- **Kong Admin API**: http://localhost:8001
- **Kong Manager**: http://localhost:8002
- **Konga (Kong Admin UI)**: http://localhost:1337
- **Product Service**: http://localhost:8081 (direct access)
- **Order Service**: http://localhost:8082 (direct access)
- **Inventory Service**: http://localhost:8083 (direct access)
- **Payment Service**: http://localhost:8084 (direct access)
- **Shipping Service**: http://localhost:8085 (direct access)

**Note**: In production, you would typically only expose the Kong Gateway (8000) to external clients and keep the other services internal.

## API Endpoints

All endpoints are accessible through the Kong Gateway at http://localhost:8000

### Product Service
- `GET /api/product`: Get all products
- `POST /api/product`: Create a new product

### Order Service
- `GET /api/order`: Get all orders
- `POST /api/order`: Place a new order

### Inventory Service
- `GET /api/inventory?productIds=id1,id2`: Check if products are in stock
- `POST /api/inventory`: Update inventory
- `PUT /api/inventory/{productId}/reduce?quantity=1`: Reduce product quantity

### Payment Service
- `POST /api/payment/process`: Process payment
- `POST /api/payment/{paymentId}/refund`: Refund payment
- `GET /api/payment/order/{orderId}`: Get payments by order ID

### Shipping Service
- `POST /api/shipping`: Create shipment
- `PUT /api/shipping/{shipmentId}/status`: Update shipment status
- `GET /api/shipping/tracking/{trackingNumber}`: Get shipment by tracking number
- `GET /api/shipping/order/{orderId}`: Get shipments by order ID

## Kong Gateway Management

### Using Konga UI

1. Access Konga at http://localhost:1337
2. Create an admin account on first login
3. Connect to Kong Admin API:
   - Name: default
   - Kong Admin URL: http://kong:8001

### Managing Kong via API

- List all services: `curl http://localhost:8001/services`
- List all routes: `curl http://localhost:8001/routes`
- List all plugins: `curl http://localhost:8001/plugins`
