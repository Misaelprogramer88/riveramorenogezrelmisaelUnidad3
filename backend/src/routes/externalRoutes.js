import { Router } from 'express';
import { externalController } from '../controllers/externalController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoint privado que actúa como proxy/integración con la API pública de tipo de cambio
router.get('/exchange-rate', authenticateJWT, externalController.getExchangeRate);

export default router;
