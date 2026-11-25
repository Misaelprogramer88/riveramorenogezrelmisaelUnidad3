import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.resolve(
  __dirname,
  `../data/test-db-${process.pid}-${Date.now()}.json`
);

// Usar base de datos aislada para la suite de pruebas
process.env.DB_FILE = testDbPath;

const { default: app } = await import('../src/app.js');
const { db } = await import('../src/repositories/jsonDatabase.js');
const { userRepository } = await import('../src/repositories/userRepository.js');

describe('POSCore API — Pruebas de Seguridad, CRUD y Web Services', () => {
  let authToken = '';
  let createdProductId = '';

  beforeAll(() => {
    db.reset();
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    vi.restoreAllMocks();
  });

  describe('1. Cabeceras de Seguridad (Helmet) y Salud de la API', () => {
    it('GET /api/health debe responder 200 OK e incluir cabeceras de seguridad Helmet', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('2. Autenticación JWT, Encriptación Bcrypt y Validación', () => {
    it('POST /api/auth/register debe registrar usuario, encriptar contraseña con bcrypt y emitir JWT', async () => {
      const res = await request(app).post('/api/auth/register').send({
        nombre: 'Andrea QA Tester',
        email: 'qa.tester@poscore.mx',
        password: 'PasswordSeguro2026!',
        role: 'ADMIN',
        departamento: 'Aseguramiento de Calidad'
      });

      expect(res.status).toBe(201);
      expect(res.body.statusText).toBe('201 Created');
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user.email).toBe('qa.tester@poscore.mx');

      // Verificar que la contraseña en base de datos está hasheada con bcrypt
      const storedUser = userRepository.findByEmail('qa.tester@poscore.mx');
      expect(storedUser).not.toBeNull();
      expect(storedUser.passwordHash).not.toBe('PasswordSeguro2026!');
      expect(storedUser.passwordHash.startsWith('$2a$10$')).toBe(true);
    });

    it('POST /api/auth/login debe autenticar credenciales válidas y devolver 200 OK con token JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@poscore.mx',
        password: 'Admin123!'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTypeOf('string');
      expect(res.body.data.user.role).toBe('ADMIN');

      authToken = res.body.data.token;
    });

    it('POST /api/auth/login debe rechazar credenciales incorrectas con 401 Unauthorized', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@poscore.mx',
        password: 'ContraseñaIncorrecta'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login debe rechazar correo mal formado con 400 Bad Request (express-validator)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'correo-invalido',
        password: ''
      });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('3. Protección de Rutas Privadas (Middleware JWT)', () => {
    it('GET /api/products sin token JWT debe devolver 401 Unauthorized', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('401 Unauthorized');
    });

    it('GET /api/products con token inválido debe devolver 401 Unauthorized', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer token.falso.alterado');
      expect(res.status).toBe(401);
    });

    it('GET /api/auth/security-status con JWT válido debe devolver estado de protección activo', async () => {
      const res = await request(app)
        .get('/api/auth/security-status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.sessionProtected).toBe(true);
      expect(res.body.data.authenticatedUser.role).toBe('ADMIN');
      expect(res.body.data.tokenInfo.truncated).toContain('...');
    });
  });

  describe('4. API RESTful CRUD de Terminales POS (/api/products)', () => {
    it('POST /api/products debe validar entradas y rechazar datos inválidos con 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: '!',
          nombre: 'A',
          precioMxn: -50,
          stock: -1
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });

    it('POST /api/products debe crear una nueva terminal POS y devolver 201 Created', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sku: 'TEST-POS-999',
          nombre: 'Terminal SmartPOS Urovo i9000S',
          modelo: 'i9000S 4G NFC',
          marca: 'Urovo',
          categoria: 'Terminal Móvil Android',
          precioMxn: 5400,
          stock: 12,
          descripcion: 'Terminal móvil de prueba automatizada.'
        });

      expect(res.status).toBe(201);
      expect(res.body.statusText).toBe('201 Created');
      expect(res.body.data.sku).toBe('TEST-POS-999');
      expect(res.body.data.estado).toBe('DISPONIBLE');

      createdProductId = res.body.data.id;
    });

    it('GET /api/products debe listar las terminales incluyendo el registro creado (200 OK)', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((item) => item.id === createdProductId)).toBe(true);
    });

    it('PUT /api/products/:id debe actualizar precio y stock recalculando el estado (200 OK)', async () => {
      const res = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          precioMxn: 5750,
          stock: 3
        });

      expect(res.status).toBe(200);
      expect(res.body.data.precioMxn).toBe(5750);
      expect(res.body.data.stock).toBe(3);
      expect(res.body.data.estado).toBe('STOCK_BAJO');
    });

    it('DELETE /api/products/:id debe eliminar el registro y responder 200 OK', async () => {
      const delRes = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.id).toBe(createdProductId);

      const getRes = await request(app)
        .get(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('5. Web Service de Terceros (Tipo de Cambio USD/MXN) y Cotizaciones', () => {
    it('GET /api/external/exchange-rate debe consumir el servicio externo y devolver tipo de cambio USD/MXN', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          base: 'USD',
          date: '2026-11-24',
          rates: { MXN: 20.15 }
        })
      });

      const res = await request(app)
        .get('/api/external/exchange-rate?refresh=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.rateUsdToMxn).toBe(20.15);
      expect(res.body.data.live).toBe(true);
      expect(res.body.data.sourceName).toContain('ExchangeRate-API');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('POST /api/quotes debe calcular subtotal, IVA 16%, total MXN y total USD (201 Created)', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cliente: 'Roberto Salinas',
          empresa: 'Farmacias del Norte',
          emailCliente: 'roberto@farmaciasnorte.mx',
          items: [{ productId: 'pos-001', cantidad: 2 }],
          notas: 'Entrega urgente en sucursal centro'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subtotalMxn).toBe(13700);
      expect(res.body.data.ivaMxn).toBe(2192);
      expect(res.body.data.totalMxn).toBe(15892);
      expect(res.body.data.totalUsd).toBeGreaterThan(0);
    });
  });
});
