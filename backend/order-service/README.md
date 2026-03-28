# ShopEasy Order Service

## Overview
Order Service is an independent Spring Boot microservice for creating and managing orders in the ShopEasy system.

- Service port: `8082`
- Base path: `/api/orders`
- MongoDB database: `orderdb`
- MongoDB collection: `order`
- Swagger UI: `http://localhost:8082/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8082/v3/api-docs`

## Prerequisites
- Java 17+
- Maven Wrapper (`mvnw`)
- MongoDB running locally or accessible by URI

## Configuration
Main configuration file: `src/main/resources/application.yml`

Important properties:
- `server.port=8082`
- `spring.data.mongodb.uri` (default: `mongodb://localhost:27017/orderdb`)
- `spring.data.mongodb.database=orderdb`
- External service URLs under `services.*.base-url`

Optional environment variables:
- `MONGODB_URI`
- `PRODUCT_SERVICE_BASE_URL`
- `SUPERMARKET_SERVICE_BASE_URL`
- `PROMOTION_SERVICE_BASE_URL`
- `DELIVERY_SERVICE_BASE_URL`
- `NOTIFICATION_SERVICE_BASE_URL`

## Run Steps
1. Start MongoDB.
2. From backend root:
   - `cd ShopEasy/backend`
3. Compile Order Service:
   - `bash ./mvnw -Dmaven.repo.local=/tmp/.m2 -pl order-service -am clean compile`
4. Run Order Service:
   - `bash ./mvnw -pl order-service spring-boot:run`
5. Verify service health:
   - `GET http://localhost:8082/actuator/health`

## API Endpoints
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PUT /api/orders/{id}`
- `DELETE /api/orders/{id}`
- `PATCH /api/orders/{id}/status`
- `GET /api/orders/customer/{customerId}`
- `GET /api/orders/supermarket/{supermarketId}`

## Postman Samples
Base URL: `http://localhost:8082`

### 1) Create Order
- Method: `POST`
- URL: `{{baseUrl}}/api/orders`
- Body (JSON):
```json
{
  "customerId": "CUST-1001",
  "productId": "PROD-2001",
  "supermarketId": "SM-3001",
  "quantity": 2,
  "unitPrice": 1500.00,
  "discountAmount": 100.00,
  "deliveryCharge": 200.00
}
```

### 2) Get All Orders
- Method: `GET`
- URL: `{{baseUrl}}/api/orders`

### 3) Get Order By ID
- Method: `GET`
- URL: `{{baseUrl}}/api/orders/{orderId}`

### 4) Update Order
- Method: `PUT`
- URL: `{{baseUrl}}/api/orders/{orderId}`
- Body (JSON):
```json
{
  "customerId": "CUST-1001",
  "productId": "PROD-2001",
  "supermarketId": "SM-3001",
  "quantity": 3,
  "unitPrice": 1500.00,
  "discountAmount": 150.00,
  "deliveryCharge": 250.00,
  "status": "PROCESSING"
}
```

### 5) Update Order Status
- Method: `PATCH`
- URL: `{{baseUrl}}/api/orders/{orderId}/status`
- Body (JSON):
```json
{
  "status": "DISPATCHED"
}
```

### 6) Delete Order
- Method: `DELETE`
- URL: `{{baseUrl}}/api/orders/{orderId}`

### 7) Get Orders By Customer
- Method: `GET`
- URL: `{{baseUrl}}/api/orders/customer/CUST-1001`

### 8) Get Orders By Supermarket
- Method: `GET`
- URL: `{{baseUrl}}/api/orders/supermarket/SM-3001`

## Notes
- External service clients (Product, Supermarket, Promotion, Delivery, Notification) are integration-ready and currently use safe stub implementations.
- Inter-service relation is by IDs only (`productId`, `supermarketId`, `orderId`).
