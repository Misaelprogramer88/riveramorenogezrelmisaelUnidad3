import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { handleValidationErrors } from '../middlewares/validateMiddleware.js';
import { loginValidator, registerValidator } from '../validators/authValidator.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/register', registerValidator, handleValidationErrors, authController.register);
router.post('/login', loginValidator, handleValidationErrors, authController.login);

// Rutas privadas protegidas con JWT
router.get('/me', authenticateJWT, authController.getProfile);
router.get('/security-status', authenticateJWT, authController.getSecurityStatus);

export default router;
