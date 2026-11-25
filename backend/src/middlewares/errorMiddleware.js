/**
 * Middleware para rutas no encontradas (404).
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    statusCode: 404,
    statusText: '404 Not Found',
    message: `La ruta ${req.method} ${req.originalUrl} no existe en la API.`
  });
}

/**
 * Middleware centralizado de manejo de errores.
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const statusMap = {
    400: '400 Bad Request',
    401: '401 Unauthorized',
    403: '403 Forbidden',
    404: '404 Not Found',
    409: '409 Conflict',
    500: '500 Internal Server Error'
  };

  if (statusCode >= 500) {
    console.error('[API ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    statusText: statusMap[statusCode] || `${statusCode} Error`,
    message: err.message || 'Error interno del servidor.',
    ...(err.details ? { details: err.details } : {})
  });
}
