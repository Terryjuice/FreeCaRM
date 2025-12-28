import { Router } from 'express';
import {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
  uploadInspectionImage,
  analyzeInspectionImages,
} from '../controllers/inspection.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createInspection);
router.get('/', getInspections);
router.get('/:id', getInspectionById);
router.put('/:id', updateInspection);
router.delete('/:id', deleteInspection);
router.post('/:id/images', upload.single('image'), uploadInspectionImage);
router.post('/:id/analyze', analyzeInspectionImages);

export default router;
