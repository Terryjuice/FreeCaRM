import { Router } from 'express';
import { getSettings, updateSettings, setApiKey, testApiKey } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/api-key', setApiKey);
router.post('/test-api-key', testApiKey);

export default router;
