import { Router } from 'express';
import { MechanicController } from '../controllers/mechanicController.js';

const router = Router();

router.get('/', MechanicController.getAllMechanics);
router.get('/:id', MechanicController.getMechanicById);
router.patch('/:id', MechanicController.updateMechanicStatus);

export default router;
