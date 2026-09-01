import { Router } from 'express';
import { SimulationController } from '../controllers/simulationController.js';

const router = Router();

router.get('/status', SimulationController.getStatus);
router.post('/start', SimulationController.start);
router.post('/stop', SimulationController.stop);

export default router;
