import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import contactRoutes from "./routes/contact";
import organizationsRoutes from "./organizations/organizations.routes";
import emailRoutes from "./email";
import imagekitRoutes from "./imagekit";
import siteStatusRoutes from "./site-status";
import envKeysRoutes from "./env-keys";
import aiRoutes from "./ai";
import apiLogRoutes from "./api-logs/log.routes";
import featureFlagRoutes from "./feature-flags/featureFlag.routes";
import cronJobRoutes from "./cron-jobs/cronJob.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4004;

// CORS configuration for production and development
const allowedOrigins = [
  // Local development
  "http://localhost:4003",
  "http://127.0.0.1:4003",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Production domains
  "https://services.exyconn.com",
  "https://www.services.exyconn.com",
  "https://exyconn.com",
  "https://www.exyconn.com",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow all subdomains of exyconn.com
    if (origin.endsWith(".exyconn.com") || origin === "https://exyconn.com") {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "x-api-key",
    "X-API-Key",
  ],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/contact", contactRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/organizations/:orgId/email", emailRoutes);
app.use("/api/organizations/:orgId/imagekit", imagekitRoutes);
app.use("/api/organizations/:orgId/site-status", siteStatusRoutes);
app.use("/api/organizations/:orgId/env-keys", envKeysRoutes);
app.use("/api/organizations/:orgId/ai", aiRoutes);
app.use("/api/organizations/:orgId/logs", apiLogRoutes);
app.use("/api/organizations/:orgId/feature-flags", featureFlagRoutes);
app.use("/api/organizations/:orgId/cron-jobs", cronJobRoutes);


// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Connect to database and start server
const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Services Server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
