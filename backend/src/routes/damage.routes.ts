import { Router } from 'express';
import {
  getDamagesByInspection,
  getDamageById,
  updateDamage,
  deleteDamage,
  createManualDamage,
} from '../controllers/damage.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/inspection/:inspectionId', getDamagesByInspection);
router.get('/:id', getDamageById);
router.post('/', createManualDamage);
router.put('/:id', updateDamage);
router.delete('/:id', deleteDamage);

export default router;
