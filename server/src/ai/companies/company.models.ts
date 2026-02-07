import mongoose, { Schema, Document } from "mongoose";

export type AIProvider = "openai" | "gemini" | "anthropic" | "custom";

export interface IAICompany extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  provider: AIProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  defaultModel?: string;
  availableModels: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Default models for each provider
export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  openai: ["gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
  gemini: [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-pro",
  ],
  anthropic: [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  custom: [],
};

const AICompanySchema = new Schema<IAICompany>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    provider: {
      type: String,
      enum: ["openai", "gemini", "anthropic", "custom"],
      required: true,
    },
    apiKey: { type: String, required: true },
    apiSecret: { type: String },
    baseUrl: { type: String },
    defaultModel: { type: String },
    availableModels: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        // Mask API keys
        if (ret.apiKey)
          ret.apiKey = "••••••••" + (ret.apiKey as string).slice(-4);
        if (ret.apiSecret) ret.apiSecret = "••••••••";
        return ret;
      },
    },
  },
);

AICompanySchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const AICompany = mongoose.model<IAICompany>(
  "AICompany",
  AICompanySchema,
);
