import { Router } from 'express';
import * as logController from './log.controllers';

const router = Router({ mergeParams: true });

// Email Log routes
router.get('/', logController.getEmailLogs);
router.get('/stats', logController.getEmailStats);
router.get('/analytics', logController.getEmailAnalytics);
router.get('/:logId', logController.getEmailLog);

export default router;
