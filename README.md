```mermaid
graph LR
    Client[💻 Client] --> Gateway[🚪 API Gateway]

    Gateway --> Registry[📘 Service Registry]
    Gateway --> UserService[👤 User Service]
    Gateway --> ProductService[📦 Product Service]

    UserService --> Registry
    ProductService --> Registry

    subgraph 🔄 Service Communication
        Registry --> Gateway
        UserService --> Registry
        ProductService --> Registry
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
