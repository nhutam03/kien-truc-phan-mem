# Microservice Interaction Diagram

## Service Interaction Flow

Below is a detailed diagram showing how the different microservices interact with each other:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                              Client Application                         │
│                                                                         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ HTTP Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                               API Gateway                               │
│                                                                         │
└───────────┬─────────────────────────┬─────────────────────────┬─────────┘
            │                         │                         │
            │                         │                         │
            ▼                         ▼                         ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│  Product Service  │◄────►│   Order Service   │◄────►│ Customer Service  │
│                   │      │                   │      │                   │
└─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
          │                          │                          │
          │                          │                          │
          ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│    Product DB     │      │     Order DB      │      │    Customer DB    │
│                   │      │                   │      │                   │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

## Detailed Service Interactions

### 1. Creating an Order

When a client creates a new order, the following interactions occur:

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌────────────┐     ┌─────────────┐
│ Client  │     │API Gateway │     │Order Service│     │Product Svc │     │Customer Svc │
└────┬────┘     └─────┬──────┘     └──────┬──────┘     └─────┬──────┘     └──────┬──────┘
     │                │                   │                  │                   │
     │ POST /api/orders                   │                  │                   │
     │───────────────►│                   │                  │                   │
     │                │ POST /orders      │                  │                   │
     │                │──────────────────►│                  │                   │
     │                │                   │ GET /customers/{id}                  │
     │                │                   │──────────────────────────────────────►
     │                │                   │                  │                   │
     │                │                   │◄──────────────────────────────────────
     │                │                   │                  │                   │
     │                │                   │ GET /products/{id}                   │
     │                │                   │─────────────────►│                   │
     │                │                   │                  │                   │
     │                │                   │◄─────────────────│                   │
     │                │                   │                  │                   │
     │                │                   │ PUT /products/{id}                   │
     │                │                   │─────────────────►│                   │
     │                │                   │                  │                   │
     │                │                   │◄─────────────────│                   │
     │                │                   │                  │                   │
     │                │◄──────────────────│                  │                   │
     │                │                   │                  │                   │
     │◄───────────────│                   │                  │                   │
     │                │                   │                  │                   │
```

### 2. Cancelling an Order

When a client cancels an order, the following interactions occur:

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌────────────┐
│ Client  │     │API Gateway │     │Order Service│     │Product Svc │
└────┬────┘     └─────┬──────┘     └──────┬──────┘     └─────┬──────┘
     │                │                   │                  │
     │ DELETE /api/orders/{id}            │                  │
     │───────────────►│                   │                  │
     │                │ DELETE /orders/{id}                  │
     │                │──────────────────►│                  │
     │                │                   │ GET /orders/{id} │
     │                │                   │──────────────────┤
     │                │                   │                  │
     │                │                   │ GET /products/{id}
     │                │                   │─────────────────►│
     │                │                   │                  │
     │                │                   │◄─────────────────│
     │                │                   │                  │
     │                │                   │ PUT /products/{id}
     │                │                   │─────────────────►│
     │                │                   │                  │
     │                │                   │◄─────────────────│
     │                │                   │                  │
     │                │◄──────────────────│                  │
     │                │                   │                  │
     │◄───────────────│                   │                  │
     │                │                   │                  │
```

## API Gateway Routing

The API Gateway routes requests to the appropriate microservice based on the URL path:

- `/api/products/*` → Product Service
- `/api/orders/*` → Order Service
- `/api/customers/*` → Customer Service

This provides a single entry point for clients while maintaining the separation of concerns between services.
