import { Router } from 'express';
import { monitorRoutes } from './monitors';
import { historyRoutes } from './history';
import { historyController } from './history';

const router = Router({ mergeParams: true });

// Monitor routes
router.use('/monitors', monitorRoutes);

// History routes
router.use('/history', historyRoutes);

// Stats route
router.get('/stats', historyController.getStats);

export default router;
