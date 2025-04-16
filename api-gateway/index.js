const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 8080;
const SERVICE_REGISTRY_URL = process.env.SERVICE_REGISTRY_URL || "http://localhost:8761";

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Get service URL from registry
const getServiceUrl = async (serviceName) => {
  try {
    const response = await axios.get(`${SERVICE_REGISTRY_URL}/services/${serviceName}`);
    return response.data.serviceUrl;
  } catch (error) {
    console.error(`Error getting service ${serviceName}:`, error.message);
    throw new Error(`Service ${serviceName} not found`);
  }
};

// Dynamic proxy middleware
const createDynamicProxy = (serviceName) => {
  return async (req, res, next) => {
    try {
      const target = await getServiceUrl(serviceName);
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
          [`^/${serviceName}`]: "",
        },
      })(req, res, next);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Routes
app.use("/user-service", (req, res, next) => {
  createDynamicProxy("user-service")(req, res, next);
});

app.use("/product-service", (req, res, next) => {
  createDynamicProxy("product-service")(req, res, next);
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "up" });
});

// Gateway info
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Gateway",
    services: ["/user-service - User management service", "/product-service - Product management service"],
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
