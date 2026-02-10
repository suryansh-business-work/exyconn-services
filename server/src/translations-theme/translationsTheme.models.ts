import mongoose, { Schema, Document } from "mongoose";

// ==================== Translations Models ====================

export interface ILocale extends Document {
  organizationId: mongoose.Types.ObjectId;
  code: string; // e.g., "en", "es", "fr"
  name: string; // e.g., "English", "Spanish"
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const localeSchema = new Schema<ILocale>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    code: { type: String, required: true },
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

localeSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export const Locale = mongoose.model<ILocale>("Locale", localeSchema);

// Translation keys with values for each locale
export interface ITranslationEntry extends Document {
  organizationId: mongoose.Types.ObjectId;
  section: string; // group key, e.g., "header", "footer", "auth"
  key: string; // e.g., "welcome_message"
  values: Record<string, string>; // { en: "Hello", es: "Hola", fr: "Bonjour" }
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const translationEntrySchema = new Schema<ITranslationEntry>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    section: { type: String, required: true },
    key: { type: String, required: true },
    values: { type: Schema.Types.Mixed, default: {} },
    description: { type: String },
  },
  { timestamps: true },
);

translationEntrySchema.index(
  { organizationId: 1, section: 1, key: 1 },
  { unique: true },
);

export const TranslationEntry = mongoose.model<ITranslationEntry>(
  "TranslationEntry",
  translationEntrySchema,
);

// ==================== Theme Models ====================

export interface ITheme extends Document {
  organizationId: mongoose.Types.ObjectId;
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

const themeSchema = new Schema<ITheme>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
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

themeSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Theme = mongoose.model<ITheme>("Theme", themeSchema);
