import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

// API Key sub-document interface
export interface IApiKey {
  keyName: string;
  apiKey: string;
  createdAt: Date;
}

// Organization document interface
export interface IOrganization extends Document {
  orgName: string;
  orgDescription?: string;
  orgSlug: string;
  orgType: "Service" | "Product";
  orgApiKeys: IApiKey[];
  createdAt: Date;
  updatedAt: Date;
}

// API Key schema
const ApiKeySchema = new Schema<IApiKey>(
  {
    keyName: { type: String, required: true, maxlength: 50 },
    apiKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// Organization schema
const OrganizationSchema = new Schema<IOrganization>(
  {
    orgName: { type: String, required: true, minlength: 2, maxlength: 100 },
    orgDescription: { type: String, maxlength: 500 },
    orgSlug: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-z][a-zA-Z0-9]*$/,
    },
    orgType: { type: String, required: true, enum: ["Service", "Product"] },
    orgApiKeys: { type: [ApiKeySchema], default: [] },
  },
  { timestamps: true },
);

// Indexes
OrganizationSchema.index({
  orgName: "text",
  orgSlug: "text",
  orgDescription: "text",
});
OrganizationSchema.index({ orgType: 1 });
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ "orgApiKeys.apiKey": 1 });

export const OrganizationModel = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema,
);

// Generate API key
export const generateApiKey = (): string =>
  `sk_${crypto.randomBytes(32).toString("hex")}`;

// Helper to convert document to plain object with id
export const toPlainObject = (doc: IOrganization) => ({
  id: doc._id.toString(),
  orgName: doc.orgName,
  orgDescription: doc.orgDescription,
  orgSlug: doc.orgSlug,
  orgType: doc.orgType,
  orgApiKeys: doc.orgApiKeys.map((k) => ({
    keyName: k.keyName,
    apiKey: k.apiKey,
    createdAt: k.createdAt.toISOString(),
  })),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});
