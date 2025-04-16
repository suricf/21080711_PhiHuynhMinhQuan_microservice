const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_REGISTRY_URL = process.env.SERVICE_REGISTRY_URL || "http://localhost:8761";
const SERVICE_NAME = "user-service";
const SERVICE_URL = `http://user-service:${PORT}`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// In-memory user database
const users = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
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
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(user);
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "up" });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
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
