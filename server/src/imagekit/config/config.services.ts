import mongoose from 'mongoose';
import { ImageKitConfigModel, IImageKitConfig } from './config.models';
import { CreateConfigInput, UpdateConfigInput, ListConfigQuery } from './config.validators';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const configService = {
  async list(orgId: string, query: ListConfigQuery): Promise<PaginatedResult<IImageKitConfig>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const filter: Record<string, unknown> = { organizationId: new mongoose.Types.ObjectId(orgId) };

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      ImageKitConfigModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IImageKitConfig[]>(),
      ImageKitConfigModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(orgId: string, configId: string): Promise<IImageKitConfig | null> {
    return ImageKitConfigModel.findOne({
      _id: new mongoose.Types.ObjectId(configId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    }).lean() as Promise<IImageKitConfig | null>;
  },

  async getDefault(orgId: string): Promise<IImageKitConfig | null> {
    return ImageKitConfigModel.findOne({
      organizationId: new mongoose.Types.ObjectId(orgId),
      isDefault: true,
      isActive: true,
    }).lean() as Promise<IImageKitConfig | null>;
  },

  async create(orgId: string, data: CreateConfigInput): Promise<IImageKitConfig> {
    if (data.isDefault) {
      await ImageKitConfigModel.updateMany(
        { organizationId: new mongoose.Types.ObjectId(orgId) },
        { isDefault: false }
      );
    }

    const config = new ImageKitConfigModel({
      ...data,
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return config.save();
  },

  async update(
    orgId: string,
    configId: string,
    data: UpdateConfigInput
  ): Promise<IImageKitConfig | null> {
    if (data.isDefault) {
      await ImageKitConfigModel.updateMany(
        {
          organizationId: new mongoose.Types.ObjectId(orgId),
          _id: { $ne: new mongoose.Types.ObjectId(configId) },
        },
        { isDefault: false }
      );
    }

    return ImageKitConfigModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(configId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      },
      { $set: data },
      { new: true }
    ).lean() as Promise<IImageKitConfig | null>;
  },

  async delete(orgId: string, configId: string): Promise<boolean> {
    const result = await ImageKitConfigModel.deleteOne({
      _id: new mongoose.Types.ObjectId(configId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return result.deletedCount > 0;
  },
};
