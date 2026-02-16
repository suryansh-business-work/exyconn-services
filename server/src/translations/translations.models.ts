import mongoose, { Schema, Document } from "mongoose";

// ==================== Translation Project ====================

export interface ISection {
  name: string;
  slug: string;
}

export interface ITranslationProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const translationProjectSchema = new Schema<ITranslationProject>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    sections: {
      type: [{ name: { type: String, required: true }, slug: { type: String, required: true } }],
      default: [],
    },
  },
  { timestamps: true },
);

translationProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const TranslationProject = mongoose.model<ITranslationProject>(
  "TranslationProject",
  translationProjectSchema,
);

// ==================== Locale ====================

export interface ILocale extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const localeSchema = new Schema<ILocale>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },
    code: { type: String, required: true },
    name: { type: String, required: true },
    nativeName: { type: String, required: true },
    flag: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

localeSchema.index({ organizationId: 1, projectId: 1, code: 1 }, { unique: true });

export const Locale = mongoose.model<ILocale>("Locale", localeSchema);

// ==================== Translation Entry ====================

export interface ITranslationEntry extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  section: string;
  key: string;
  values: Record<string, string>;
  defaultValue?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const translationEntrySchema = new Schema<ITranslationEntry>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },
    section: { type: String, required: true },
    key: { type: String, required: true },
    values: { type: Schema.Types.Mixed, default: {} },
    defaultValue: { type: String },
    description: { type: String },
  },
  { timestamps: true },
);

translationEntrySchema.index(
  { organizationId: 1, projectId: 1, section: 1, key: 1 },
  { unique: true },
);

export const TranslationEntry = mongoose.model<ITranslationEntry>(
  "TranslationEntry",
  translationEntrySchema,
);
