import mongoose from 'mongoose';
import { SmtpConfigModel, ISmtpConfig } from './smtp.models';
import {
  CreateSmtpConfigInput,
  UpdateSmtpConfigInput,
  ListSmtpConfigsQuery,
} from './smtp.validators';

// Transform Mongoose document to plain object
const transformSmtpConfig = (doc: ISmtpConfig) => ({
  id: doc._id.toString(),
  organizationId: doc.organizationId.toString(),
  name: doc.name,
  host: doc.host,
  port: doc.port,
  secure: doc.secure,
  username: doc.username,
  password: doc.password,
  fromEmail: doc.fromEmail,
  fromName: doc.fromName,
  isDefault: doc.isDefault,
  isActive: doc.isActive,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

// Create SMTP config
export const createSmtpConfig = async (organizationId: string, data: CreateSmtpConfigInput) => {
  // Check for duplicate name within org
  const existing = await SmtpConfigModel.findOne({ organizationId, name: data.name });
  if (existing) {
    throw new Error(`SMTP configuration with name "${data.name}" already exists`);
  }

  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await SmtpConfigModel.updateMany({ organizationId, isDefault: true }, { isDefault: false });
  }

  // If no configs exist, make this the default
  const configCount = await SmtpConfigModel.countDocuments({ organizationId });
  if (configCount === 0) {
    data.isDefault = true;
  }

  const smtpConfig = new SmtpConfigModel({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    ...data,
  });

  await smtpConfig.save();
  return transformSmtpConfig(smtpConfig);
};

// Get all SMTP configs for an organization
export const getSmtpConfigs = async (organizationId: string, query: ListSmtpConfigsQuery) => {
  const { page, limit, search, isActive } = query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { organizationId };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { host: { $regex: search, $options: 'i' } },
      { fromEmail: { $regex: search, $options: 'i' } },
    ];
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  const [configs, total] = await Promise.all([
    SmtpConfigModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SmtpConfigModel.countDocuments(filter),
  ]);

  return {
    data: configs.map(transformSmtpConfig),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single SMTP config
export const getSmtpConfig = async (organizationId: string, configId: string) => {
  const config = await SmtpConfigModel.findOne({
    _id: configId,
    organizationId,
  });

  if (!config) {
    throw new Error('SMTP configuration not found');
  }

  return transformSmtpConfig(config);
};

// Update SMTP config
export const updateSmtpConfig = async (
  organizationId: string,
  configId: string,
  data: UpdateSmtpConfigInput
) => {
  // Check for duplicate name within org (if name is being updated)
  if (data.name) {
    const existing = await SmtpConfigModel.findOne({
      organizationId,
      name: data.name,
      _id: { $ne: configId },
    });
    if (existing) {
      throw new Error(`SMTP configuration with name "${data.name}" already exists`);
    }
  }

  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await SmtpConfigModel.updateMany(
      { organizationId, isDefault: true, _id: { $ne: configId } },
      { isDefault: false }
    );
  }

  const config = await SmtpConfigModel.findOneAndUpdate(
    { _id: configId, organizationId },
    { ...data },
    { new: true, runValidators: true }
  );

  if (!config) {
    throw new Error('SMTP configuration not found');
  }

  return transformSmtpConfig(config);
};

// Delete SMTP config
export const deleteSmtpConfig = async (organizationId: string, configId: string) => {
  const config = await SmtpConfigModel.findOneAndDelete({
    _id: configId,
    organizationId,
  });

  if (!config) {
    throw new Error('SMTP configuration not found');
  }

  // If deleted config was default, make another one default
  if (config.isDefault) {
    const nextConfig = await SmtpConfigModel.findOne({ organizationId });
    if (nextConfig) {
      nextConfig.isDefault = true;
      await nextConfig.save();
    }
  }

  return { message: 'SMTP configuration deleted successfully' };
};

// Get default SMTP config for an organization
export const getDefaultSmtpConfig = async (organizationId: string) => {
  const config = await SmtpConfigModel.findOne({
    organizationId,
    isDefault: true,
    isActive: true,
  });

  if (!config) {
    throw new Error('No default SMTP configuration found');
  }

  return transformSmtpConfig(config);
};
