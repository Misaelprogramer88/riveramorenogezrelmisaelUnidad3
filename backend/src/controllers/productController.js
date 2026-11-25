import { productService } from '../services/productService.js';

export const productController = {
  list(req, res, next) {
    try {
      const { search, categoria, estado } = req.query;
      const products = productService.list({ search, categoria, estado });
      const summary = productService.getInventorySummary();
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `${products.length} terminal(es) recuperada(s) del inventario.`,
        data: products,
        meta: summary
      });
    } catch (error) {
      return next(error);
    }
  },

  getById(req, res, next) {
    try {
      const product = productService.getById(req.params.id);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        data: product
      });
    } catch (error) {
      return next(error);
    }
  },

  create(req, res, next) {
    try {
      const created = productService.create(req.body);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        statusText: '201 Created',
        message: `Terminal POS '${created.nombre}' creada correctamente.`,
        data: created
      });
    } catch (error) {
      return next(error);
    }
  },

  update(req, res, next) {
    try {
      const updated = productService.update(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `Terminal POS '${updated.nombre}' actualizada correctamente.`,
        data: updated
      });
    } catch (error) {
      return next(error);
    }
  },

  remove(req, res, next) {
    try {
      const deleted = productService.remove(req.params.id);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: `Terminal POS '${deleted.nombre}' eliminada del inventario.`,
        data: deleted
      });
    } catch (error) {
      return next(error);
    }
  }
};
