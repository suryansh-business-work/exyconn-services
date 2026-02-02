import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokenCount?: number;
}

export interface IAIChat extends Document {
  organizationId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  aiModel: string;
  messages: IChatMessage[];
  totalTokens: number;
  maxHistoryMessages: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    tokenCount: { type: Number },
  },
  { _id: false }
);

const AIChatSchema = new Schema<IAIChat>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'AICompany', required: true, index: true },
    title: { type: String, required: true },
    aiModel: { type: String, required: true },
    messages: { type: [ChatMessageSchema], default: [] },
    totalTokens: { type: Number, default: 0 },
    maxHistoryMessages: { type: Number, default: 50 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        ret.model = ret.aiModel; // Map back to model for API response
        delete ret.aiModel;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

AIChatSchema.index({ organizationId: 1, createdAt: -1 });

export const AIChat = mongoose.model<IAIChat>('AIChat', AIChatSchema);
