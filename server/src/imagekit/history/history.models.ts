import mongoose, { Schema, Document } from 'mongoose';

export type UploadMode = 'single' | 'multiple' | 'single-array' | 'multiple-array';

export interface IUploadedFile extends Document {
  organizationId: mongoose.Types.ObjectId;
  configId: mongoose.Types.ObjectId;
  apiKeyUsed?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  fileId: string;
  filePath: string;
  tags?: string[];
  uploadMode: UploadMode;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    configId: {
      type: Schema.Types.ObjectId,
      ref: 'ImageKitConfig',
      required: true,
    },
    apiKeyUsed: {
      type: String,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    fileId: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    tags: [String],
    uploadMode: {
      type: String,
      enum: ['single', 'multiple', 'single-array', 'multiple-array'],
      default: 'single',
    },
    groupId: String,
  },
  { timestamps: true }
);

UploadedFileSchema.index({ organizationId: 1, createdAt: -1 });
UploadedFileSchema.index({ organizationId: 1, fileType: 1 });
UploadedFileSchema.index({ organizationId: 1, uploadMode: 1 });
UploadedFileSchema.index({ fileName: 'text', originalName: 'text' });

export const UploadedFileModel = mongoose.model<IUploadedFile>('UploadedFile', UploadedFileSchema);
