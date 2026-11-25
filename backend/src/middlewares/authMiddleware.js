import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Middleware de protección de rutas mediante verificación de JWT (Bearer Token).
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      statusText: '401 Unauthorized',
      message: 'Acceso denegado. Se requiere un token JWT en el encabezado Authorization (Bearer).'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256']
    });
    req.user = decoded;
    req.rawToken = token;
    return next();
  } catch (error) {
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      statusCode: 401,
      statusText: '401 Unauthorized',
      message: isExpired
        ? 'Tu sesión JWT ha expirado. Inicia sesión nuevamente.'
        : 'Token JWT inválido o alterado.'
    });
  }
}

/**
 * Middleware opcional de control de acceso basado en roles (RBAC).
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        statusText: '403 Forbidden',
        message: 'No cuentas con los permisos de rol necesarios para realizar esta acción.'
      });
    }
    return next();
  };
}
