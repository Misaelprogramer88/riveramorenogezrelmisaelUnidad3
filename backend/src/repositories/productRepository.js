import crypto from 'crypto';
import { db } from './jsonDatabase.js';

/**
 * Patrón Repository para la entidad Producto (Terminal POS / Dispositivo).
 * Aísla el almacenamiento físico de la lógica de negocio.
 */
export class ProductRepository {
  findAll({ search = '', categoria = '', estado = '' } = {}) {
    const data = db.read();
    let results = [...data.products];

    if (search) {
      const term = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.modelo.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.marca.toLowerCase().includes(term)
      );
    }

    if (categoria) {
      results = results.filter(
        (p) => p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (estado) {
      results = results.filter(
        (p) => p.estado.toLowerCase() === estado.toLowerCase()
      );
    }

    return results;
  }

  findById(id) {
    const data = db.read();
    return data.products.find((p) => p.id === id) || null;
  }

  findBySku(sku) {
    const normalized = sku.trim().toUpperCase();
    const data = db.read();
    return data.products.find((p) => p.sku.toUpperCase() === normalized) || null;
  }

  create(payload) {
    const data = db.read();
    const now = new Date().toISOString();
    const stock = Number(payload.stock);

    const newProduct = {
      id: `pos-${crypto.randomUUID().slice(0, 8)}`,
      sku: payload.sku.trim().toUpperCase(),
      nombre: payload.nombre.trim(),
      modelo: payload.modelo.trim(),
      marca: payload.marca.trim(),
      categoria: payload.categoria.trim(),
      precioMxn: Number(Number(payload.precioMxn).toFixed(2)),
      stock,
      estado: this.computeStatus(stock),
      descripcion: (payload.descripcion || '').trim(),
      createdAt: now,
      updatedAt: now
    };

    data.products.unshift(newProduct);
    db.write(data);
    return newProduct;
  }

  update(id, updates) {
    const data = db.read();
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = data.products[index];
    const nextStock =
      updates.stock !== undefined ? Number(updates.stock) : current.stock;

    const updated = {
      ...current,
      sku: updates.sku !== undefined ? updates.sku.trim().toUpperCase() : current.sku,
      nombre: updates.nombre !== undefined ? updates.nombre.trim() : current.nombre,
      modelo: updates.modelo !== undefined ? updates.modelo.trim() : current.modelo,
      marca: updates.marca !== undefined ? updates.marca.trim() : current.marca,
      categoria:
        updates.categoria !== undefined ? updates.categoria.trim() : current.categoria,
      precioMxn:
        updates.precioMxn !== undefined
          ? Number(Number(updates.precioMxn).toFixed(2))
          : current.precioMxn,
      stock: nextStock,
      estado: this.computeStatus(nextStock),
      descripcion:
        updates.descripcion !== undefined
          ? updates.descripcion.trim()
          : current.descripcion,
      updatedAt: new Date().toISOString()
    };

    data.products[index] = updated;
    db.write(data);
    return updated;
  }

  delete(id) {
    const data = db.read();
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const [removed] = data.products.splice(index, 1);
    db.write(data);
    return removed;
  }

  computeStatus(stock) {
    if (stock <= 0) return 'AGOTADO';
    if (stock <= 5) return 'STOCK_BAJO';
    return 'DISPONIBLE';
  }
}

export const productRepository = new ProductRepository();
