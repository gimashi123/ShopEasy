# ShopEasy 🛒

ShopEasy is a comprehensive, microservices-based backend system designed for an online shopping and delivery platform. It provides core functionalities such as product management, order processing, delivery handling, promotions, and notifications, ensuring a scalable and modular architecture. 

It is built with **Spring Boot** on the backend and features a **React** (Vite) frontend.

## 🏗 System Architecture

The application is split into multiple independent microservices, handling specific domain logic, accompanied by an API Gateway for unified access and a React SPA for the frontend.

### Frontend
- **Frontend** - A React single-page application built with Vite and designed to provide a pleasant user interface for customers.

### Backend Microservices
- **API Gateway** (`gateway`) - The single entry point for all client requests.
- **Auth Service** (`auth-service`) - Handles user authentication, authorization, and JWT token issuance.
- **Customer Service** (`customer-service`) - Manages customer profiles and related data.
- **Product Service** (`product-service`) - Manages the product catalog.
- **Supermarket Service** (`supermarket-service`) - Handles supermarket inventory and details.
- **Order Service** (`order-service`) - Handles the shopping cart, checkout, and order lifecycle.
- **Payment Service** (`payment-service`) - Integrates with third-party payment gateways (e.g., Stripe) to process payments.
- **Delivery Service** (`delivery-service`) - Manages driver assignments, delivery tracking, and logistics.
- **Promotion Service** (`promotion-service`) - Handles discounts, coupons, and promotional campaigns.
- **Review Service** (`review-service`) - Collects and provides product/store reviews from users.

## 🚀 Technologies Used

* **Frontend:** React, Vite
* **Backend:** Java, Spring Boot, Spring Cloud Gateway
* **Databases:** MongoDB (auth, order), PostgreSQL (customer, payment)
* **Containerization:** Docker & Docker Compose
* **Communication:** REST APIs, gRPC (for inter-service communication)

## 🛠 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven
- Docker & Docker Compose

### Running with Docker Compose
The easiest way to get the core infrastructure (and optionally all services) running is via Docker Compose:
```bash
docker-compose up -d
```
*Note: Make sure to review `docker-compose.yml` to see the environment variables (like `STRIPE_SECRET_KEY`) that you might need to configure.*

### Running Locally (Development)
You can run the microservices independently using Maven. For example:
```bash
cd backend/<service-name>
mvn spring-boot:run
```
To run the frontend:
```bash
cd frontend
npm install
npm run dev
```

