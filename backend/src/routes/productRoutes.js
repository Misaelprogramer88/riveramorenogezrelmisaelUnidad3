import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { handleValidationErrors } from '../middlewares/validateMiddleware.js';
import {
  createProductValidator,
  updateProductValidator
} from '../validators/productValidator.js';

const router = Router();

// Todas las rutas del inventario requieren sesión autenticada mediante JWT
router.use(authenticateJWT);

router.get('/', productController.list);
router.get('/:id', productController.getById);
router.post('/', createProductValidator, handleValidationErrors, productController.create);
router.put('/:id', updateProductValidator, handleValidationErrors, productController.update);
router.delete('/:id', productController.remove);

export default router;
