import mongoose, { Schema, Document } from "mongoose";

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
