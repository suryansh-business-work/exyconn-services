import { Request, Response } from "express";
import { historyService } from "./history.services";
import { ListHistoryQuery } from "./history.validators";

const transformFile = (file: Record<string, unknown>) => ({
  id: file._id,
  organizationId: file.organizationId,
  configId: file.configId,
  apiKeyUsed: file.apiKeyUsed,
  fileName: file.fileName,
  originalName: file.originalName,
  fileType: file.fileType,
  mimeType: file.mimeType,
  size: file.size,
  width: file.width,
  height: file.height,
  url: file.url,
  thumbnailUrl: file.thumbnailUrl,
  fileId: file.fileId,
  filePath: file.filePath,
  tags: file.tags,
  uploadMode: file.uploadMode,
  groupId: file.groupId,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt,
});

export const historyController = {
  async list(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const query = req.query as unknown as ListHistoryQuery;
      const result = await historyService.list(orgId, query);
      res.json({
        data: result.data.map((f) =>
          transformFile(f as unknown as Record<string, unknown>),
        ),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error listing upload history:", error);
      res.status(500).json({ error: "Failed to list upload history" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const fileId = req.params.fileId as string;
      const file = await historyService.getById(orgId, fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(transformFile(file as unknown as Record<string, unknown>));
    } catch (error) {
      console.error("Error getting file:", error);
      res.status(500).json({ error: "Failed to get file" });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const stats = await historyService.getStats(orgId);
      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const fileId = req.params.fileId as string;
      const deleted = await historyService.delete(orgId, fileId);
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  },
};
