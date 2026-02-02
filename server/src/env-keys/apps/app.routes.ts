import { Router } from 'express';
import { envAppController } from './app.controllers';

const router = Router({ mergeParams: true });

router.get('/', envAppController.list);
router.get('/stats', envAppController.getStats);
router.post('/', envAppController.create);
router.get('/:appId', envAppController.get);
router.patch('/:appId', envAppController.update);
router.delete('/:appId', envAppController.delete);

export default router;
