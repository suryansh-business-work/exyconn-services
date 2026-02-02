import { Router } from 'express';
import { historyController } from './history.controllers';

const router = Router({ mergeParams: true });

router.get('/', historyController.list);
router.get('/:checkId', historyController.get);

export default router;
