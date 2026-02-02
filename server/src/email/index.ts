import { Router } from 'express';
import { smtpRoutes } from './smtp';
import { templateRoutes } from './templates';
import { sendRoutes } from './send';
import { logRoutes } from './logs';

const router = Router({ mergeParams: true });

// Mount sub-routes
router.use('/smtp', smtpRoutes);
router.use('/templates', templateRoutes);
router.use('/logs', logRoutes);
router.use('/', sendRoutes);

export default router;
