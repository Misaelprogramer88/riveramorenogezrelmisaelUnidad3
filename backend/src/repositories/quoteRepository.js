import crypto from 'crypto';
import { db } from './jsonDatabase.js';

/**
 * Patrón Repository para la entidad Cotización.
 */
export class QuoteRepository {
  findAll() {
    const data = db.read();
    return data.quotes;
  }

  findById(id) {
    const data = db.read();
    return data.quotes.find((q) => q.id === id) || null;
  }

  create(payload) {
    const data = db.read();
    const sequence = String(data.quotes.length + 1).padStart(4, '0');
    const year = new Date().getFullYear();

    const newQuote = {
      id: `cot-${crypto.randomUUID().slice(0, 8)}`,
      folio: `COT-${year}-${sequence}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    data.quotes.unshift(newQuote);
    db.write(data);
    return newQuote;
  }

  updateStatus(id, estado) {
    const data = db.read();
    const index = data.quotes.findIndex((q) => q.id === id);
    if (index === -1) return null;

    data.quotes[index] = {
      ...data.quotes[index],
      estado,
      updatedAt: new Date().toISOString()
    };
    db.write(data);
    return data.quotes[index];
  }

  delete(id) {
    const data = db.read();
    const index = data.quotes.findIndex((q) => q.id === id);
    if (index === -1) return null;

    const [removed] = data.quotes.splice(index, 1);
    db.write(data);
    return removed;
  }
}

export const quoteRepository = new QuoteRepository();
