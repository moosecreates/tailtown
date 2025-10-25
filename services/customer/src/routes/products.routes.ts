import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustInventory,
  getInventoryLogs,
  getLowStockProducts,
  getAllCategories,
  createCategory
} from '../controllers/products.controller';

const router = Router();

// Product routes
router.get('/products', getAllProducts);
router.get('/products/low-stock', getLowStockProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Inventory routes
router.post('/products/:id/inventory/adjust', adjustInventory);
router.get('/products/:id/inventory/logs', getInventoryLogs);

// Category routes
router.get('/product-categories', getAllCategories);
router.post('/product-categories', createCategory);

export default router;
