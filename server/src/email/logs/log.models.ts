import mongoose, { Schema, Document } from 'mongoose';

// Email Log status
export type EmailLogStatus = 'sent' | 'failed' | 'pending';

// Email Log interface
export interface IEmailLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  smtpConfigId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  apiKeyUsed?: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  status: EmailLogStatus;
  messageId?: string;
  error?: string;
  variables: Record<string, string>;
  sentAt: Date;
  createdAt: Date;
}

// Email Log schema
const EmailLogSchema = new Schema<IEmailLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    smtpConfigId: {
      type: Schema.Types.ObjectId,
      ref: 'SmtpConfig',
      required: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'EmailTemplate',
      required: true,
    },
    apiKeyUsed: {
      type: String,
    },
    recipient: {
      type: String,
      required: true,
    },
    cc: {
      type: String,
    },
    bcc: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      required: true,
    },
    messageId: {
      type: String,
    },
    error: {
      type: String,
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
EmailLogSchema.index({ organizationId: 1, sentAt: -1 });
EmailLogSchema.index({ organizationId: 1, status: 1 });
EmailLogSchema.index({ recipient: 1 });

export const EmailLogModel = mongoose.model<IEmailLog>('EmailLog', EmailLogSchema);
