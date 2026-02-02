import { Request, Response } from 'express';
import { configService } from './config.services';
import { ListConfigQuery, CreateConfigInput, UpdateConfigInput } from './config.validators';

const transformConfig = (config: Record<string, unknown>) => ({
  id: config._id,
  organizationId: config.organizationId,
  name: config.name,
  publicKey: config.publicKey,
  privateKey: '********', // Mask private key
  urlEndpoint: config.urlEndpoint,
  isDefault: config.isDefault,
  isActive: config.isActive,
  createdAt: config.createdAt,
  updatedAt: config.updatedAt,
});

export const configController = {
  async list(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const query = req.query as unknown as ListConfigQuery;
      const result = await configService.list(orgId, query);
      res.json({
        data: result.data.map((c) => transformConfig(c as unknown as Record<string, unknown>)),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error listing ImageKit configs:', error);
      res.status(500).json({ error: 'Failed to list configurations' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const configId = req.params.configId as string;
      const config = await configService.getById(orgId, configId);
      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.json(transformConfig(config as unknown as Record<string, unknown>));
    } catch (error) {
      console.error('Error getting ImageKit config:', error);
      res.status(500).json({ error: 'Failed to get configuration' });
    }
  },

  async getDefault(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const config = await configService.getDefault(orgId);
      if (!config) {
        return res.status(404).json({ error: 'No default configuration found' });
      }
      res.json(transformConfig(config as unknown as Record<string, unknown>));
    } catch (error) {
      console.error('Error getting default ImageKit config:', error);
      res.status(500).json({ error: 'Failed to get default configuration' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const data = req.body as CreateConfigInput;
      const config = await configService.create(orgId, data);
      res.status(201).json(transformConfig(config as unknown as Record<string, unknown>));
    } catch (error) {
      console.error('Error creating ImageKit config:', error);
      res.status(500).json({ error: 'Failed to create configuration' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const configId = req.params.configId as string;
      const data = req.body as UpdateConfigInput;
      const config = await configService.update(orgId, configId, data);
      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.json(transformConfig(config as unknown as Record<string, unknown>));
    } catch (error) {
      console.error('Error updating ImageKit config:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const orgId = req.params.orgId as string;
      const configId = req.params.configId as string;
      const deleted = await configService.delete(orgId, configId);
      if (!deleted) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting ImageKit config:', error);
      res.status(500).json({ error: 'Failed to delete configuration' });
    }
  },
};
