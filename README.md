```mermaid
mermaid
graph TD
    Client[💻 Client] -->|HTTP Requests| Gateway[🚪 API Gateway]

    Gateway -->|🔍 Service Lookup| Registry[📘 Service Registry]
    Gateway -->|➡️ Forward Request| UserService[👤 User Service]
    Gateway -->|➡️ Forward Request| ProductService[📦 Product Service]

    UserService -->|📝 Register| Registry
    ProductService -->|📝 Register| Registry

    subgraph "🔄 Service Communication"
        Registry -- 🔎 Service Discovery --> Gateway
        UserService -- ❤️ Health Check --> Registry
        ProductService -- ❤️ Health Check --> Registry
    end
```
# Build và khởi động toàn bộ dịch vụ
docker-compose up --build
GET http://localhost:8761/services
GET http://localhost:8080/user-service/users
GET http://localhost:8080/product-service/products
POST http://localhost:8080/product-service/products
Content-Type: application/json

{
  "name": "Tablet",
  "price": 299.99,
  "inStock": true
}
