# Microservice Sales Management System

This project demonstrates a simple sales management system built using a microservice architecture. The system consists of the following components:

## Architecture

- **Product Service**: Manages product information (name, price, description, stock)
- **Order Service**: Manages order information (creation, viewing, cancellation)
- **Customer Service**: Manages customer information (name, email, phone, address)
- **API Gateway**: Single entry point for clients to interact with the services

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

### API Gateway (Port 8080)
- `GET /api/products` - Proxy to Product Service
- `GET /api/orders` - Proxy to Order Service
- `GET /api/customers` - Proxy to Customer Service

## Technologies Used

- Node.js with Express.js for the services
- PostgreSQL for the databases
- Sequelize as the ORM
- Docker for containerization
- Docker Compose for orchestration

## Running the Application

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the following command in the root directory:

```bash
docker-compose up
```

4. The services will be available at:
   - API Gateway: http://localhost:8080
   - Product Service: http://localhost:3001
   - Order Service: http://localhost:3002
   - Customer Service: http://localhost:3003

## Testing the Application

You can use tools like Postman or curl to test the API endpoints.

### Example: Creating a Product

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99, "description": "High-performance laptop", "stock": 10}'
```

### Example: Creating a Customer

```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890", "address": "123 Main St"}'
```

### Example: Creating an Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId": 1, "items": [{"productId": 1, "quantity": 2, "price": 999.99}]}'
```
