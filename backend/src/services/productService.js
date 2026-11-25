import { productRepository } from '../repositories/productRepository.js';
import { AppError } from '../utils/AppError.js';

/**
 * Capa Service para el catálogo e inventario de Terminales Punto de Venta.
 */
export class ProductService {
  list(filters) {
    return productRepository.findAll(filters);
  }

  getById(id) {
    const product = productRepository.findById(id);
    if (!product) {
      throw new AppError(`Terminal POS con ID '${id}' no encontrada.`, 404);
    }
    return product;
  }

  create(payload) {
    const duplicate = productRepository.findBySku(payload.sku);
    if (duplicate) {
      throw new AppError(`El SKU '${payload.sku.toUpperCase()}' ya está registrado en el inventario.`, 409);
    }
    return productRepository.create(payload);
  }

  update(id, payload) {
    const existing = productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Terminal POS con ID '${id}' no encontrada.`, 404);
    }

    if (payload.sku && payload.sku.trim().toUpperCase() !== existing.sku) {
      const duplicate = productRepository.findBySku(payload.sku);
      if (duplicate && duplicate.id !== id) {
        throw new AppError(`El SKU '${payload.sku.toUpperCase()}' pertenece a otro dispositivo.`, 409);
      }
    }

    return productRepository.update(id, payload);
  }

  remove(id) {
    const deleted = productRepository.delete(id);
    if (!deleted) {
      throw new AppError(`Terminal POS con ID '${id}' no encontrada.`, 404);
    }
    return deleted;
  }

  getInventorySummary() {
    const products = productRepository.findAll();
    const totalModels = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValueMxn = Number(
      products.reduce((sum, p) => sum + p.precioMxn * p.stock, 0).toFixed(2)
    );
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    return {
      totalModels,
      totalUnits,
      totalValueMxn,
      lowStockCount,
      outOfStockCount
    };
  }
}

export const productService = new ProductService();
