import mongoose, { Schema, Document } from 'mongoose';

// Template variable interface
export interface ITemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
}

// Email Template interface
export interface IEmailTemplate extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  subject: string;
  mjmlContent: string;
  htmlContent?: string;
  variables: ITemplateVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Template Variable schema
const TemplateVariableSchema = new Schema<ITemplateVariable>(
  {
    name: { type: String, required: true, maxlength: 50 },
    description: { type: String, maxlength: 200 },
    defaultValue: { type: String, maxlength: 500 },
  },
  { _id: false }
);

// Email Template schema
const EmailTemplateSchema = new Schema<IEmailTemplate>(
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
    description: {
      type: String,
      maxlength: 500,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 255,
    },
    mjmlContent: {
      type: String,
      required: true,
    },
    htmlContent: {
      type: String,
    },
    variables: {
      type: [TemplateVariableSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for unique name per organization
EmailTemplateSchema.index({ organizationId: 1, name: 1 }, { unique: true });

// Text search index
EmailTemplateSchema.index({ name: 'text', description: 'text', subject: 'text' });

export const EmailTemplateModel = mongoose.model<IEmailTemplate>(
  'EmailTemplate',
  EmailTemplateSchema
);
