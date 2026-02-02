import mongoose, { Schema, Document } from 'mongoose';

// SMTP Configuration interface
export interface ISmtpConfig extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// SMTP Configuration schema
const SmtpConfigSchema = new Schema<ISmtpConfig>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    host: {
      type: String,
      required: true,
      maxlength: 255,
    },
    port: {
      type: Number,
      required: true,
      min: 1,
      max: 65535,
    },
    secure: {
      type: Boolean,
      default: true,
    },
    username: {
      type: String,
      required: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
      maxlength: 255,
    },
    fromName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for unique name per organization
SmtpConfigSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// Index for fetching default config
SmtpConfigSchema.index({ organizationId: 1, isDefault: 1 });

export const SmtpConfigModel = mongoose.model<ISmtpConfig>('SmtpConfig', SmtpConfigSchema);
