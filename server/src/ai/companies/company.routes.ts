import { Router } from 'express';
import { aiCompanyController } from './company.controllers';

const router = Router({ mergeParams: true });

router.get('/', aiCompanyController.list);
router.get('/stats', aiCompanyController.getStats);
router.post('/', aiCompanyController.create);
router.get('/:companyId', aiCompanyController.get);
router.patch('/:companyId', aiCompanyController.update);
router.delete('/:companyId', aiCompanyController.delete);

export default router;
