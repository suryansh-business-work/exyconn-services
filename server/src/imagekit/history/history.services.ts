import mongoose from "mongoose";
import { UploadedFileModel, IUploadedFile, UploadMode } from "./history.models";
import { ListHistoryQuery } from "./history.validators";

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  byFileType: Record<string, number>;
  byUploadMode: Record<UploadMode, number>;
}

export const historyService = {
  async list(
    orgId: string,
    query: ListHistoryQuery,
  ): Promise<PaginatedResult<IUploadedFile>> {
    const {
      page = 1,
      limit = 10,
      search,
      fileType,
      uploadMode,
      startDate,
      endDate,
      configId,
    } = query;
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };

    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } },
      ];
    }
    if (fileType) {
      filter.fileType = fileType;
    }
    if (uploadMode) {
      filter.uploadMode = uploadMode;
    }
    if (configId) {
      filter.configId = new mongoose.Types.ObjectId(configId);
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate)
        (filter.createdAt as Record<string, unknown>).$gte = new Date(
          startDate,
        );
      if (endDate)
        (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      UploadedFileModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IUploadedFile[]>(),
      UploadedFileModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(orgId: string, fileId: string): Promise<IUploadedFile | null> {
    return UploadedFileModel.findOne({
      _id: new mongoose.Types.ObjectId(fileId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    }).lean() as Promise<IUploadedFile | null>;
  },

  async getStats(orgId: string): Promise<UploadStats> {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [totalResult, sizeResult, byTypeResult, byModeResult] =
      await Promise.all([
        UploadedFileModel.countDocuments({ organizationId: orgObjectId }),
        UploadedFileModel.aggregate([
          { $match: { organizationId: orgObjectId } },
          { $group: { _id: null, totalSize: { $sum: "$size" } } },
        ]),
        UploadedFileModel.aggregate([
          { $match: { organizationId: orgObjectId } },
          { $group: { _id: "$fileType", count: { $sum: 1 } } },
        ]),
        UploadedFileModel.aggregate([
          { $match: { organizationId: orgObjectId } },
          { $group: { _id: "$uploadMode", count: { $sum: 1 } } },
        ]),
      ]);

    const byFileType: Record<string, number> = {};
    byTypeResult.forEach((item: { _id: string; count: number }) => {
      byFileType[item._id] = item.count;
    });

    const byUploadMode: Record<UploadMode, number> = {
      single: 0,
      multiple: 0,
      "single-array": 0,
      "multiple-array": 0,
    };
    byModeResult.forEach((item: { _id: UploadMode; count: number }) => {
      byUploadMode[item._id] = item.count;
    });

    return {
      totalFiles: totalResult,
      totalSize: sizeResult[0]?.totalSize || 0,
      byFileType,
      byUploadMode,
    };
  },

  async delete(orgId: string, fileId: string): Promise<boolean> {
    const result = await UploadedFileModel.deleteOne({
      _id: new mongoose.Types.ObjectId(fileId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return result.deletedCount > 0;
  },

  async create(data: Partial<IUploadedFile>): Promise<IUploadedFile> {
    const file = new UploadedFileModel(data);
    return file.save();
  },
};
