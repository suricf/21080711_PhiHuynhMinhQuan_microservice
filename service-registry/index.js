const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 8761;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// In-memory registry database
const serviceRegistry = {};

// Register a service
app.post("/register", (req, res) => {
  const { serviceName, serviceUrl } = req.body;

  if (!serviceName || !serviceUrl) {
    return res.status(400).json({ error: "Service name and URL are required" });
  }

  if (!serviceRegistry[serviceName]) {
    serviceRegistry[serviceName] = [];
  }

  // Add service if not already registered
  if (!serviceRegistry[serviceName].includes(serviceUrl)) {
    serviceRegistry[serviceName].push(serviceUrl);
    console.log(`Service registered: ${serviceName} at ${serviceUrl}`);
  }

  res.status(200).json({ message: "Service registered successfully" });
});

// Get services
app.get("/services/:serviceName", (req, res) => {
  const { serviceName } = req.params;

  if (!serviceRegistry[serviceName] || serviceRegistry[serviceName].length === 0) {
    return res.status(404).json({ error: "Service not found" });
  }

  // Simple load balancing - returns a random instance
  const randomIndex = Math.floor(Math.random() * serviceRegistry[serviceName].length);
  const serviceUrl = serviceRegistry[serviceName][randomIndex];

  res.status(200).json({ serviceUrl });
});

// Get all registered services
app.get("/services", (req, res) => {
  res.status(200).json(serviceRegistry);
});

// Deregister a service
app.delete("/services", (req, res) => {
  const { serviceName, serviceUrl } = req.body;

  if (!serviceName || !serviceUrl) {
    return res.status(400).json({ error: "Service name and URL are required" });
  }

  if (serviceRegistry[serviceName]) {
    serviceRegistry[serviceName] = serviceRegistry[serviceName].filter((url) => url !== serviceUrl);
    console.log(`Service deregistered: ${serviceName} at ${serviceUrl}`);
  }

  res.status(200).json({ message: "Service deregistered successfully" });
});

app.listen(PORT, () => {
  console.log(`Service Registry running on port ${PORT}`);
});
