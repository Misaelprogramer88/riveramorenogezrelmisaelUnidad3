import { authService } from '../services/authService.js';

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        statusText: '201 Created',
        message: 'Usuario registrado exitosamente con contraseña encriptada (bcrypt) y token JWT generado.',
        data: result
      });
    } catch (error) {
      return next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: 'Inicio de sesión exitoso. Token JWT activo.',
        data: result
      });
    } catch (error) {
      return next(error);
    }
  },

  getProfile(req, res, next) {
    try {
      const profile = authService.getProfile(req.user.sub);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        data: profile
      });
    } catch (error) {
      return next(error);
    }
  },

  getSecurityStatus(req, res, next) {
    try {
      const status = authService.getSecurityStatus(req.user, req.rawToken);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: 'Verificación de seguridad completada sobre ruta privada JWT.',
        data: status
      });
    } catch (error) {
      return next(error);
    }
  }
};
