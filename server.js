// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");

// Import route files
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

const PORT = process.env.PORT || 5000;

if (cluster.isMaster) {
    // Fork workers for each CPU core
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart a worker if it crashes
    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    // Function to start the server and set up middlewares and routes
    function startServer() {
        const app = express();

        // Connect to MongoDB
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Updated: maxPoolSize replaces poolSize
        })
        .then(() => console.log("MongoDB connected"))
        .catch((error) => console.error("MongoDB connection error:", error));

        // Set up CORS with client URL
        app.use(cors({
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST", "DELETE", "PUT"],
            allowedHeaders: [
                "Content-Type",
                "Authorization",
                "Cache-Control",
                "Expires",
                "Pragma",
            ],
            credentials: true, // Allow cookies and authorization headers
        }));

        app.options("*", cors()); // Handle preflight requests for all routes

        // Middleware setup
        app.use(cookieParser());
        app.use(express.json());
        app.use(compression()); // Compress responses to reduce response size

        // Rate limiting to prevent abuse
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per window
        });
        app.use(limiter);

        // Route setup
        app.use("/api/auth", authRouter);
        app.use("/api/admin/products", adminProductsRouter);
        app.use("/api/admin/orders", adminOrderRouter);
        app.use("/api/shop/products", shopProductsRouter);
        app.use("/api/shop/cart", shopCartRouter);
        app.use("/api/shop/address", shopAddressRouter);
        app.use("/api/shop/order", shopOrderRouter);
        app.use("/api/shop/search", shopSearchRouter);
        app.use("/api/shop/review", shopReviewRouter);
        app.use("/api/common/feature", commonFeatureRouter);

        // Start server
        app.listen(PORT, () => {
            console.log(`Worker ${process.pid} is running on port ${PORT}`);
        });
    }

    startServer(); // Start the server instance
}
