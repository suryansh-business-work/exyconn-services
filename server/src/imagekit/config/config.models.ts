import mongoose, { Schema, Document } from "mongoose";

export interface IImageKitConfig extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ImageKitConfigSchema = new Schema<IImageKitConfig>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    urlEndpoint: {
      type: String,
      required: true,
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
  { timestamps: true },
);

ImageKitConfigSchema.index({ organizationId: 1, name: 1 }, { unique: true });
ImageKitConfigSchema.index({ organizationId: 1, isDefault: 1 });

export const ImageKitConfigModel = mongoose.model<IImageKitConfig>(
  "ImageKitConfig",
  ImageKitConfigSchema,
);
