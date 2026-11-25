import { validationResult } from 'express-validator';

/**
 * Middleware que procesa los resultados de express-validator y devuelve
 * una respuesta 400 Bad Request estructurada ante entradas inválidas.
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      statusText: '400 Bad Request',
      message: 'Error de validación en los datos enviados.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  return next();
}
