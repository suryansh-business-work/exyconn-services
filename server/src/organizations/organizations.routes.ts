import { Router } from 'express';
import { organizationsController } from './organizations.controllers';

const router = Router();

// List all organizations (with pagination, filtering, sorting)
router.get('/', organizationsController.list);

// Get organization by ID
router.get('/:id', organizationsController.getById);

// Get organization by slug
router.get('/slug/:slug', organizationsController.getBySlug);

// Create organization
router.post('/', organizationsController.create);

// Update organization
router.put('/:id', organizationsController.update);
router.patch('/:id', organizationsController.update);

// Delete organization
router.delete('/:id', organizationsController.delete);

// API Keys management
router.post('/:id/api-keys', organizationsController.addApiKey);
router.delete('/:id/api-keys/:apiKey', organizationsController.removeApiKey);

export default router;
