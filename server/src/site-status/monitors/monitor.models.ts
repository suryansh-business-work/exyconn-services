import mongoose, { Schema, Document } from "mongoose";

export interface ISiteCheckOptions {
  httpStatus: boolean;
  sslCertificate: boolean;
  dnsRecords: boolean;
  mxRecords: boolean;
  screenshot: boolean;
  pageInfo: boolean;
  responseTime: boolean;
}

export interface ISiteMonitor extends Document {
  organizationId: mongoose.Types.ObjectId;
  url: string;
  name: string;
  isActive: boolean;
  checks: ISiteCheckOptions;
  lastCheckedAt?: Date;
  lastStatus?: "healthy" | "warning" | "error";
  lastScreenshotUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteCheckOptionsSchema = new Schema<ISiteCheckOptions>(
  {
    httpStatus: { type: Boolean, default: true },
    sslCertificate: { type: Boolean, default: true },
    dnsRecords: { type: Boolean, default: false },
    mxRecords: { type: Boolean, default: false },
    screenshot: { type: Boolean, default: true },
    pageInfo: { type: Boolean, default: true },
    responseTime: { type: Boolean, default: true },
  },
  { _id: false },
);

const SiteMonitorSchema = new Schema<ISiteMonitor>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    url: { type: String, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    checks: { type: SiteCheckOptionsSchema, required: true },
    lastCheckedAt: { type: Date },
    lastStatus: { type: String, enum: ["healthy", "warning", "error"] },
    lastScreenshotUrl: { type: String },
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

SiteMonitorSchema.index({ organizationId: 1, url: 1 }, { unique: true });
SiteMonitorSchema.index({ organizationId: 1, name: 1 });

export const SiteMonitor = mongoose.model<ISiteMonitor>(
  "SiteMonitor",
  SiteMonitorSchema,
);
