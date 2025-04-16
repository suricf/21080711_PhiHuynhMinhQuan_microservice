const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE_REGISTRY_URL = process.env.SERVICE_REGISTRY_URL || "http://localhost:8761";
const SERVICE_NAME = "product-service";
const SERVICE_URL = `http://product-service:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// In-memory product database
const products = [
  { id: 1, name: "Laptop", price: 999.99, inStock: true },
  { id: 2, name: "Smartphone", price: 499.99, inStock: true },
  { id: 3, name: "Headphones", price: 99.99, inStock: false },
];

// Register service with registry
const registerService = async () => {
  try {
    await axios.post(`${SERVICE_REGISTRY_URL}/register`, {
      serviceName: SERVICE_NAME,
      serviceUrl: SERVICE_URL,
    });
    console.log("Service registered successfully");
  } catch (error) {
    console.error("Failed to register service:", error.message);
    // Retry after delay
    setTimeout(registerService, 5000);
  }
};

// Routes
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json(product);
});

app.post("/products", (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    price,
    inStock: inStock || false,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "up" });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
  registerService();
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  try {
    await axios.delete(`${SERVICE_REGISTRY_URL}/services`, {
      data: {
        serviceName: SERVICE_NAME,
        serviceUrl: SERVICE_URL,
      },
    });
    console.log("Service deregistered successfully");
  } catch (error) {
    console.error("Failed to deregister service:", error.message);
  }
  process.exit(0);
});
