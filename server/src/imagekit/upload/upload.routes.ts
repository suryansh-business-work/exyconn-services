import { Router } from 'express';
import multer from 'multer';
import { uploadController } from './upload.controllers';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

router.post('/', upload.single('file'), uploadController.uploadSingle);
router.post('/bulk', upload.array('files', 20), uploadController.uploadMultiple);

export default router;
