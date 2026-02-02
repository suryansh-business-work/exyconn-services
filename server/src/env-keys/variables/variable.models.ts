import mongoose, { Schema, Document } from 'mongoose';

export interface IEnvVariable extends Document {
  organizationId: mongoose.Types.ObjectId;
  appId: mongoose.Types.ObjectId;
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnvVariableSchema = new Schema<IEnvVariable>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    appId: { type: Schema.Types.ObjectId, ref: 'EnvApp', required: true, index: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    isSecret: { type: Boolean, default: false },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = (ret._id as { toString(): string }).toString();
        delete ret._id;
        delete ret.__v;
        // Mask secret values
        if (ret.isSecret) {
          ret.value = '••••••••';
        }
        return ret;
      },
    },
  }
);

EnvVariableSchema.index({ appId: 1, key: 1 }, { unique: true });

export const EnvVariable = mongoose.model<IEnvVariable>('EnvVariable', EnvVariableSchema);
