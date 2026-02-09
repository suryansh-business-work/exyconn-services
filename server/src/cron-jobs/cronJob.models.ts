import mongoose, { Schema, Document } from "mongoose";

export type CronJobStatus = "active" | "paused" | "completed" | "failed";
export type CronJobMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ICronJobExecution {
  executedAt: Date;
  status: "success" | "failure";
  responseStatus?: number;
  responseTime?: number;
  responseBody?: string;
  error?: string;
  duration: number;
}

export interface ICronJob extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  cronExpression: string;
  timezone: string;
  webhookUrl: string;
  method: CronJobMethod;
  headers: Record<string, string>;
  body: string;
  status: CronJobStatus;
  retryCount: number;
  maxRetries: number;
  timeout: number;
  lastExecutedAt?: Date;
  nextExecutionAt?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICronJobHistory extends Document {
  organizationId: mongoose.Types.ObjectId;
  cronJobId: mongoose.Types.ObjectId;
  jobName: string;
  executedAt: Date;
  status: "success" | "failure";
  responseStatus?: number;
  responseTime?: number;
  responseBody?: string;
  requestUrl: string;
  requestMethod: CronJobMethod;
  error?: string;
  duration: number;
  retryAttempt: number;
  createdAt: Date;
}

const CronJobSchema = new Schema<ICronJob>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    cronExpression: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    webhookUrl: { type: String, required: true },
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      default: "GET",
    },
    headers: { type: Schema.Types.Mixed, default: {} },
    body: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "failed"],
      default: "active",
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    timeout: { type: Number, default: 30000 },
    lastExecutedAt: { type: Date },
    nextExecutionAt: { type: Date },
    executionCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

CronJobSchema.index({ organizationId: 1, status: 1 });
CronJobSchema.index({ organizationId: 1, createdAt: -1 });
CronJobSchema.index({ status: 1, nextExecutionAt: 1 });
CronJobSchema.index(
  { organizationId: 1, name: "text", description: "text" },
  { weights: { name: 10, description: 5 } },
);

const CronJobHistorySchema = new Schema<ICronJobHistory>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    cronJobId: {
      type: Schema.Types.ObjectId,
      ref: "CronJob",
      required: true,
      index: true,
    },
    jobName: { type: String, required: true },
    executedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    responseStatus: { type: Number },
    responseTime: { type: Number },
    responseBody: { type: String },
    requestUrl: { type: String, required: true },
    requestMethod: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      required: true,
    },
    error: { type: String },
    duration: { type: Number, required: true },
    retryAttempt: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

CronJobHistorySchema.index({ organizationId: 1, cronJobId: 1, executedAt: -1 });
CronJobHistorySchema.index({ organizationId: 1, status: 1 });
CronJobHistorySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }, // 90 days TTL
);

export const CronJob = mongoose.model<ICronJob>("CronJob", CronJobSchema);
export const CronJobHistory = mongoose.model<ICronJobHistory>(
  "CronJobHistory",
  CronJobHistorySchema,
);
