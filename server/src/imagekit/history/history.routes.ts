import { Router } from 'express';
import { historyController } from './history.controllers';

const router = Router({ mergeParams: true });

router.get('/', historyController.list);
router.get('/:fileId', historyController.getById);
router.delete('/:fileId', historyController.delete);

export default router;
