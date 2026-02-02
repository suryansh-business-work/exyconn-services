import { Router } from 'express';
import * as templateController from './template.controllers';

const router = Router({ mergeParams: true });

// Email Template routes (all scoped to organization)
router.post('/', templateController.createEmailTemplate);
router.get('/', templateController.getEmailTemplates);
router.post('/preview', templateController.previewTemplate);
router.get('/:templateId', templateController.getEmailTemplate);
router.put('/:templateId', templateController.updateEmailTemplate);
router.delete('/:templateId', templateController.deleteEmailTemplate);

export default router;
