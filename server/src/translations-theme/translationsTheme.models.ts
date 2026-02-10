import mongoose, { Schema, Document } from "mongoose";

// ==================== Translation Project ====================

export interface ITranslationProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const translationProjectSchema = new Schema<ITranslationProject>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
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

// ==================== Theme Project ====================

export interface IThemeProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const themeProjectSchema = new Schema<IThemeProject>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);

themeProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const ThemeProject = mongoose.model<IThemeProject>("ThemeProject", themeProjectSchema);

// ==================== Theme ====================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  [key: string]: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: number;
  fontWeightLight: number;
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
  captionSize: string;
}

export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  full: number;
}

export interface ITheme extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  components: Record<string, Record<string, string>>;
  createdAt: Date;
  updatedAt: Date;
}

const themeSchema = new Schema<ITheme>(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    colors: { type: Schema.Types.Mixed, required: true },
    typography: { type: Schema.Types.Mixed, required: true },
    spacing: { type: Schema.Types.Mixed, required: true },
    borderRadius: { type: Schema.Types.Mixed, required: true },
    components: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

themeSchema.index({ organizationId: 1, projectId: 1, name: 1 }, { unique: true });

export const Theme = mongoose.model<ITheme>("Theme", themeSchema);
