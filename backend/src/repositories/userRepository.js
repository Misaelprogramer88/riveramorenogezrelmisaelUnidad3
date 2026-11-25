import crypto from 'crypto';
import { db } from './jsonDatabase.js';

/**
 * Patrón Repository para la entidad Usuario.
 * Encapsula toda operación de acceso a datos de usuarios.
 */
export class UserRepository {
  findAll() {
    const data = db.read();
    return data.users;
  }

  findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const data = db.read();
    return data.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  findById(id) {
    const data = db.read();
    return data.users.find((u) => u.id === id) || null;
  }

  create({ nombre, email, passwordHash, role = 'VENDEDOR', departamento = 'Operaciones' }) {
    const data = db.read();
    const newUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      nombre,
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
      departamento,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    db.write(data);
    return newUser;
  }
}

export const userRepository = new UserRepository();
