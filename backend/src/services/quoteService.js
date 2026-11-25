import { quoteRepository } from '../repositories/quoteRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { exchangeRateService } from './exchangeRateService.js';
import { AppError } from '../utils/AppError.js';

const IVA_RATE = 0.16;

/**
 * Capa Service para la gestión y cálculo de Cotizaciones de Terminales POS.
 */
export class QuoteService {
  list() {
    return quoteRepository.findAll();
  }

  getById(id) {
    const quote = quoteRepository.findById(id);
    if (!quote) {
      throw new AppError(`Cotización con ID '${id}' no encontrada.`, 404);
    }
    return quote;
  }

  async create(payload, user) {
    const resolvedItems = [];

    for (const item of payload.items) {
      const product = productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(
          `El dispositivo con ID '${item.productId}' no existe en el catálogo.`,
          400
        );
      }

      const cantidad = Number(item.cantidad);
      const subtotalMxn = Number((product.precioMxn * cantidad).toFixed(2));

      resolvedItems.push({
        productId: product.id,
        sku: product.sku,
        nombre: product.nombre,
        cantidad,
        precioUnitarioMxn: product.precioMxn,
        subtotalMxn
      });
    }

    const subtotalMxn = Number(
      resolvedItems.reduce((acc, it) => acc + it.subtotalMxn, 0).toFixed(2)
    );
    const ivaMxn = Number((subtotalMxn * IVA_RATE).toFixed(2));
    const totalMxn = Number((subtotalMxn + ivaMxn).toFixed(2));

    const exchange = await exchangeRateService.getUsdToMxnRate();
    const tipoCambioUsd = exchange.rateUsdToMxn;
    const totalUsd = Number((totalMxn / tipoCambioUsd).toFixed(2));

    return quoteRepository.create({
      cliente: payload.cliente.trim(),
      empresa: payload.empresa.trim(),
      emailCliente: payload.emailCliente.trim().toLowerCase(),
      items: resolvedItems,
      subtotalMxn,
      ivaMxn,
      totalMxn,
      tipoCambioUsd,
      totalUsd,
      estado: 'BORRADOR',
      notas: (payload.notas || '').trim(),
      createdBy: user.nombre
    });
  }

  updateStatus(id, estado) {
    const allowed = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'];
    if (!allowed.includes(estado)) {
      throw new AppError(`Estado '${estado}' no válido.`, 400);
    }
    const updated = quoteRepository.updateStatus(id, estado);
    if (!updated) {
      throw new AppError(`Cotización con ID '${id}' no encontrada.`, 404);
    }
    return updated;
  }

  remove(id) {
    const removed = quoteRepository.delete(id);
    if (!removed) {
      throw new AppError(`Cotización con ID '${id}' no encontrada.`, 404);
    }
    return removed;
  }
}

export const quoteService = new QuoteService();
