import { quoteService } from '../services/quoteService.js';

export const quoteController = {
  list(req, res, next) {
    try {
      const quotes = quoteService.list();
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `${quotes.length} cotización(es) cargada(s).`,
        data: quotes
      });
    } catch (error) {
      return next(error);
    }
  },

  getById(req, res, next) {
    try {
      const quote = quoteService.getById(req.params.id);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        data: quote
      });
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const created = await quoteService.create(req.body, req.user);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        statusText: '201 Created',
        message: `Cotización ${created.folio} generada con conversión USD en tiempo real.`,
        data: created
      });
    } catch (error) {
      return next(error);
    }
  },

  updateStatus(req, res, next) {
    try {
      const updated = quoteService.updateStatus(req.params.id, req.body.estado);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `Estado de cotización ${updated.folio} actualizado a ${updated.estado}.`,
        data: updated
      });
    } catch (error) {
      return next(error);
    }
  },

  remove(req, res, next) {
    try {
      const deleted = quoteService.remove(req.params.id);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `Cotización ${deleted.folio} eliminada correctamente.`,
        data: deleted
      });
    } catch (error) {
      return next(error);
    }
  }
};
