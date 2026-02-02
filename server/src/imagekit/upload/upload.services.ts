import ImageKit from 'imagekit';
import mongoose from 'mongoose';
import { configService, IImageKitConfig } from '../config';
import { historyService, UploadMode } from '../history';

interface UploadOptions {
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  apiKey?: string;
  uploadMode?: UploadMode;
}

interface UploadedFileResult {
  success: boolean;
  file?: {
    id: string;
    organizationId: string;
    configId: string;
    apiKeyUsed?: string;
    fileName: string;
    originalName: string;
    fileType: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    url: string;
    thumbnailUrl?: string;
    fileId: string;
    filePath: string;
    tags?: string[];
    uploadMode: UploadMode;
  };
  error?: string;
}

interface BulkUploadResult {
  success: boolean;
  files: UploadedFileResult['file'][];
  errors: Array<{ fileName: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
    return 'document';
  return 'other';
};

const createImageKitClient = (config: IImageKitConfig) => {
  return new ImageKit({
    publicKey: config.publicKey,
    privateKey: config.privateKey,
    urlEndpoint: config.urlEndpoint,
  });
};

export const uploadService = {
  async uploadSingle(
    orgId: string,
    configId: string,
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadedFileResult> {
    try {
      const config = await configService.getById(orgId, configId);
      if (!config) {
        return { success: false, error: 'Configuration not found' };
      }

      const imagekit = createImageKitClient(config);

      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: options.folder || '/',
        tags: options.tags,
        useUniqueFileName: options.useUniqueFileName ?? true,
      });

      const savedFile = await historyService.create({
        organizationId: new mongoose.Types.ObjectId(orgId),
        configId: new mongoose.Types.ObjectId(configId),
        apiKeyUsed: options.apiKey,
        fileName: uploadResponse.name,
        originalName: file.originalname,
        fileType: getFileType(file.mimetype),
        mimeType: file.mimetype,
        size: uploadResponse.size,
        width: uploadResponse.width,
        height: uploadResponse.height,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        fileId: uploadResponse.fileId,
        filePath: uploadResponse.filePath,
        tags: options.tags,
        uploadMode: options.uploadMode || 'single',
      });

      return {
        success: true,
        file: {
          id: savedFile._id.toString(),
          organizationId: orgId,
          configId,
          apiKeyUsed: options.apiKey,
          fileName: uploadResponse.name,
          originalName: file.originalname,
          fileType: getFileType(file.mimetype),
          mimeType: file.mimetype,
          size: uploadResponse.size,
          width: uploadResponse.width,
          height: uploadResponse.height,
          url: uploadResponse.url,
          thumbnailUrl: uploadResponse.thumbnailUrl,
          fileId: uploadResponse.fileId,
          filePath: uploadResponse.filePath,
          tags: options.tags,
          uploadMode: options.uploadMode || 'single',
        },
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },

  async uploadMultiple(
    orgId: string,
    configId: string,
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<BulkUploadResult> {
    const results: BulkUploadResult = {
      success: true,
      files: [],
      errors: [],
      totalUploaded: 0,
      totalFailed: 0,
    };

    const groupId = new mongoose.Types.ObjectId().toString();
    const uploadMode = options.uploadMode || 'multiple';

    for (const file of files) {
      const result = await this.uploadSingle(orgId, configId, file, {
        ...options,
        uploadMode,
      });

      if (result.success && result.file) {
        results.files.push(result.file);
        results.totalUploaded++;
      } else {
        results.errors.push({
          fileName: file.originalname,
          error: result.error || 'Unknown error',
        });
        results.totalFailed++;
      }
    }

    results.success = results.totalFailed === 0;
    return results;
  },

  async deleteFile(orgId: string, configId: string, fileId: string): Promise<boolean> {
    try {
      const config = await configService.getById(orgId, configId);
      if (!config) return false;

      const imagekit = createImageKitClient(config);
      await imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  },
};
