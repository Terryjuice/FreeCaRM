import { Router } from 'express';
import { generateReport, downloadReport } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/generate/:inspectionId', generateReport);
router.get('/download/:reportId', downloadReport);

export default router;
