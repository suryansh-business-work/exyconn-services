import mongoose, { Schema, Document } from "mongoose";

export interface IEnvApp extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  environment: "development" | "staging" | "production";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EnvAppSchema = new Schema<IEnvApp>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "development",
    },
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
        return ret;
      },
    },
  },
);

EnvAppSchema.index(
  { organizationId: 1, name: 1, environment: 1 },
  { unique: true },
);

export const EnvApp = mongoose.model<IEnvApp>("EnvApp", EnvAppSchema);
