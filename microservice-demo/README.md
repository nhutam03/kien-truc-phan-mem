# Microservice Sales Management System

This project demonstrates a simple sales management system built using a microservice architecture. The system consists of the following components:

## Architecture

- **Product Service**: Manages product information (name, price, description, stock)
- **Order Service**: Manages order information (creation, viewing, cancellation)
- **Customer Service**: Manages customer information (name, email, phone, address)
- **Kong API Gateway**: Single entry point for clients to interact with the services, providing routing, rate limiting, and other API management features

Each service has its own database to maintain separation of concerns and follow the "Database per Service" principle.

## Service Communication Diagram

```
                  ┌─────────────┐
                  │             │
                  │   Client    │
                  │             │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │             │
                  │ API Gateway │
                  │             │
                  └──┬─────┬────┘
                     │     │     │
         ┌───────────┘     │     └────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
┌─────────────────┐ ┌─────────────┐  ┌────────────────┐
│                 │ │             │  │                │
│ Product Service │ │ Order Service│  │Customer Service│
│                 │ │             │  │                │
└────────┬────────┘ └──────┬──────┘  └────────┬───────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌─────────────────┐ ┌─────────────┐  ┌────────────────┐
│                 │ │             │  │                │
│  Product DB     │ │   Order DB  │  │   Customer DB  │
│                 │ │             │  │                │
└─────────────────┘ └─────────────┘  └────────────────┘
```

## API Endpoints

### Product Service (Port 3001)
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create a new product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Order Service (Port 3002)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create a new order
- `PUT /orders/:id` - Update order status
- `DELETE /orders/:id` - Delete an order

### Customer Service (Port 3003)
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create a new customer
- `PUT /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer

### Kong API Gateway (Port 8000)
- `GET /api/products` - Proxy to Product Service
- `GET /api/orders` - Proxy to Order Service
- `GET /api/customers` - Proxy to Customer Service

### Kong Admin API (Port 8001)
- Used for configuring Kong API Gateway

### Konga - Kong Admin UI (Port 1337)
- Web interface for managing Kong API Gateway

## Technologies Used

- Node.js with Express.js for the services
- PostgreSQL for the databases
- Sequelize as the ORM
- Kong API Gateway for API management
- Docker for containerization
- Docker Compose for orchestration

## Running the Application

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the following commands in the root directory:

```bash
# Start all services
docker-compose up -d

# Configure Kong API Gateway
chmod +x kong-config.sh
./kong-config.sh
```

4. The services will be available at:
   - Kong API Gateway: http://localhost:8000
   - Kong Admin API: http://localhost:8001
   - Konga (Kong Admin UI): http://localhost:1337
   - Product Service: http://localhost:3001
   - Order Service: http://localhost:3002
   - Customer Service: http://localhost:3003

5. For detailed instructions on using Kong API Gateway, refer to the [Kong README](KONG_README.md)

## Testing the Application

You can use tools like Postman or curl to test the API endpoints.

### Example: Creating a Product

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99, "description": "High-performance laptop", "stock": 10}'
```

### Example: Creating a Customer

```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "address": "123 Main St"}'
```

### Example: Creating an Order

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "items": [{"productId": 1, "quantity": 2, "price": 999.99}]}'
```

## Using Kong API Gateway

For more detailed information about using Kong API Gateway, including:

- Configuring services and routes
- Using the Konga admin UI
- Available plugins
- Troubleshooting

Please refer to the [Kong README](KONG_README.md).
