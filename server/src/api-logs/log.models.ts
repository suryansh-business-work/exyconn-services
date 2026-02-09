import mongoose, { Document, Schema } from "mongoose";

export type ApiLogLevel = "info" | "warn" | "error" | "debug";
export type ApiLogMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export interface IApiLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  method: ApiLogMethod;
  url: string;
  statusCode: number;
  level: ApiLogLevel;
  message: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseBody: unknown;
  responseTime: number; // in ms
  ip: string;
  userAgent: string;
  apiKeyUsed: string;
  tags: string[];
  source: string;
  metadata: Record<string, unknown>;
  error: string;
  stack: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApiLogSchema = new Schema<IApiLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
      default: "GET",
    },
    url: { type: String, default: "" },
    statusCode: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      default: "info",
    },
    message: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed, default: {} },
    requestBody: { type: Schema.Types.Mixed, default: null },
    responseBody: { type: Schema.Types.Mixed, default: null },
    responseTime: { type: Number, default: 0 },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    apiKeyUsed: { type: String, default: "" },
    tags: [{ type: String }],
    source: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    error: { type: String, default: "" },
    stack: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient querying with heavy data
ApiLogSchema.index({ organizationId: 1, createdAt: -1 });
ApiLogSchema.index({ organizationId: 1, level: 1, createdAt: -1 });
ApiLogSchema.index({ organizationId: 1, statusCode: 1 });
ApiLogSchema.index({ organizationId: 1, method: 1 });
ApiLogSchema.index({ organizationId: 1, source: 1 });
ApiLogSchema.index({ organizationId: 1, tags: 1 });
ApiLogSchema.index({ message: "text", url: "text", error: "text" });

// TTL index: auto-delete logs older than 90 days by default
// This can be overridden per org via settings
ApiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const ApiLogModel = mongoose.model<IApiLog>("ApiLog", ApiLogSchema);

// Settings model for log retention & configuration
export interface IApiLogSettings extends Document {
  organizationId: mongoose.Types.ObjectId;
  retentionDays: number;
  maxLogsPerDay: number;
  enabledLevels: ApiLogLevel[];
  enableRequestBodyCapture: boolean;
  enableResponseBodyCapture: boolean;
  excludedPaths: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApiLogSettingsSchema = new Schema<IApiLogSettings>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    retentionDays: { type: Number, default: 90, min: 1, max: 365 },
    maxLogsPerDay: { type: Number, default: 100000, min: 1000 },
    enabledLevels: {
      type: [String],
      default: ["info", "warn", "error", "debug"],
    },
    enableRequestBodyCapture: { type: Boolean, default: true },
    enableResponseBodyCapture: { type: Boolean, default: false },
    excludedPaths: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

export const ApiLogSettingsModel = mongoose.model<IApiLogSettings>(
  "ApiLogSettings",
  ApiLogSettingsSchema,
);
