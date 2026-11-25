import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import externalRoutes from './externalRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    statusText: '200 OK',
    service: 'POSCore API RESTful',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/external', externalRoutes);

export default router;
