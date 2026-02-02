import { Request, Response } from 'express';
import { organizationsService } from './organizations.services';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  listOrganizationsQuerySchema,
  addApiKeySchema,
} from './organizations.validators';
import { ZodError } from 'zod';

const formatZodError = (error: ZodError) => ({
  success: false,
  error: 'Validation error',
  details: error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
});

export const organizationsController = {
  // Create organization
  create: async (req: Request, res: Response) => {
    try {
      const data = createOrganizationSchema.parse(req.body);
      const organization = await organizationsService.createOrganization(data);
      return res.status(201).json({ success: true, data: organization });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Get organization by ID
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const organization = await organizationsService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }
      return res.json({ success: true, data: organization });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Get organization by slug
  getBySlug: async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug as string;
      const organization = await organizationsService.getOrganizationBySlug(slug);
      if (!organization) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }
      return res.json({ success: true, data: organization });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // List organizations
  list: async (req: Request, res: Response) => {
    try {
      const query = listOrganizationsQuerySchema.parse(req.query);
      const result = await organizationsService.listOrganizations(query);
      return res.json({ success: true, ...result });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Update organization
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const data = updateOrganizationSchema.parse(req.body);
      const organization = await organizationsService.updateOrganization(id, data);
      if (!organization) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }
      return res.json({ success: true, data: organization });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Delete organization
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const deleted = await organizationsService.deleteOrganization(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }
      return res.json({ success: true, message: 'Organization deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Add API key
  addApiKey: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { keyName } = addApiKeySchema.parse(req.body);
      const apiKey = await organizationsService.addApiKey(id, keyName);
      if (!apiKey) {
        return res.status(404).json({ success: false, error: 'Organization not found' });
      }
      return res.status(201).json({ success: true, data: apiKey });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  // Remove API key
  removeApiKey: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const apiKey = req.params.apiKey as string;
      const removed = await organizationsService.removeApiKey(id, apiKey);
      if (!removed) {
        return res.status(404).json({ success: false, error: 'Organization or API key not found' });
      }
      return res.json({ success: true, message: 'API key removed successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};
