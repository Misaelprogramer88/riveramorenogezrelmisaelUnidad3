import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Capa Service para Autenticación y Seguridad (JWT + Bcrypt).
 */
export class AuthService {
  sanitizeUser(user) {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      departamento: user.departamento,
      createdAt: user.createdAt
    };
  }

  signToken(user) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn,
        algorithm: 'HS256',
        issuer: 'poscore-api'
      }
    );
  }

  async register({ nombre, email, password, role = 'VENDEDOR', departamento = 'Ventas y Cotizaciones' }) {
    const existing = userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Ya existe un usuario registrado con ese correo electrónico.', 409);
    }

    const allowedRoles = ['ADMIN', 'VENDEDOR'];
    const normalizedRole = allowedRoles.includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'VENDEDOR';

    // Encriptación irreversible con bcrypt (Blowfish + Salt de 10 rondas)
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const created = userRepository.create({
      nombre,
      email,
      passwordHash,
      role: normalizedRole,
      departamento
    });

    const token = this.signToken(created);

    return {
      user: this.sanitizeUser(created),
      token,
      security: {
        tokenType: 'Bearer',
        algorithm: 'HS256',
        expiresIn: env.jwtExpiresIn,
        passwordHashing: `bcrypt (${BCRYPT_SALT_ROUNDS} salt rounds)`
      }
    };
  }

  async login({ email, password }) {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Credenciales inválidas. Verifica tu correo y contraseña.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas. Verifica tu correo y contraseña.', 401);
    }

    const token = this.signToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      security: {
        tokenType: 'Bearer',
        algorithm: 'HS256',
        expiresIn: env.jwtExpiresIn,
        passwordHashing: `bcrypt (${BCRYPT_SALT_ROUNDS} salt rounds)`
      }
    };
  }

  getProfile(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado.', 404);
    }
    return this.sanitizeUser(user);
  }

  getSecurityStatus(decodedToken, rawToken) {
    const user = userRepository.findById(decodedToken.sub);
    if (!user) {
      throw new AppError('Sesión inválida: usuario no encontrado.', 401);
    }

    const truncatedToken =
      rawToken.length > 36
        ? `${rawToken.slice(0, 22)}...${rawToken.slice(-14)}`
        : rawToken;

    return {
      sessionProtected: true,
      authenticatedUser: this.sanitizeUser(user),
      tokenInfo: {
        truncated: truncatedToken,
        algorithm: 'HS256',
        issuer: decodedToken.iss || 'poscore-api',
        issuedAt: decodedToken.iat ? new Date(decodedToken.iat * 1000).toISOString() : null,
        expiresAt: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : null
      },
      mechanisms: {
        jwtAuthentication: true,
        passwordEncryption: `bcrypt (Blowfish, ${BCRYPT_SALT_ROUNDS} salt rounds)`,
        passwordHashPrefix: `${user.passwordHash.slice(0, 14)}...`,
        helmetHeaders: true,
        corsPolicy: env.corsOrigin,
        inputValidation: 'express-validator (sanitización y validación estricta)',
        routeProtection: 'Middleware Bearer JWT + Verificación de Roles'
      },
      verifiedAt: new Date().toISOString()
    };
  }
}

export const authService = new AuthService();
