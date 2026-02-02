import { Request, Response } from 'express';
import { uploadService } from './upload.services';
import { UploadMode } from '../history';

export const uploadController = {
  async uploadSingle(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const { configId, folder, tags, useUniqueFileName, apiKey, uploadMode } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const parsedTags = tags ? JSON.parse(tags) : undefined;
      const result = await uploadService.uploadSingle(orgId, configId, req.file, {
        folder,
        tags: parsedTags,
        useUniqueFileName: useUniqueFileName === 'true',
        apiKey,
        uploadMode: uploadMode as UploadMode,
      });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json(result);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  },

  async uploadMultiple(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const { configId, folder, tags, useUniqueFileName, apiKey, uploadMode } = req.body;

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const parsedTags = tags ? JSON.parse(tags) : undefined;
      const result = await uploadService.uploadMultiple(orgId, configId, files, {
        folder,
        tags: parsedTags,
        useUniqueFileName: useUniqueFileName === 'true',
        apiKey,
        uploadMode: (uploadMode as UploadMode) || 'multiple',
      });

      res.json(result);
    } catch (error) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ error: 'Bulk upload failed' });
    }
  },
};
