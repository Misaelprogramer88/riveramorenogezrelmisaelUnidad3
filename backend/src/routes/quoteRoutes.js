import { Router } from 'express';
import { quoteController } from '../controllers/quoteController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { handleValidationErrors } from '../middlewares/validateMiddleware.js';
import {
  createQuoteValidator,
  updateQuoteStatusValidator
} from '../validators/quoteValidator.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', quoteController.list);
router.get('/:id', quoteController.getById);
router.post('/', createQuoteValidator, handleValidationErrors, quoteController.create);
router.patch(
  '/:id/status',
  updateQuoteStatusValidator,
  handleValidationErrors,
  quoteController.updateStatus
);
router.delete('/:id', quoteController.remove);

export default router;
