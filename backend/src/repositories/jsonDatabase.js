import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Capa de persistencia JSON ligera con escritura atómica y carga inicial (seed).
 * Implementa el patrón Singleton por ruta de archivo para mantener consistencia.
 */
class JsonDatabase {
  constructor(filePath = env.dbFile) {
    this.filePath = filePath;
    this.ensureInitialized();
  }

  getFilePath() {
    return process.env.DB_FILE || this.filePath;
  }

  ensureInitialized() {
    const targetPath = this.getFilePath();
    const dir = path.dirname(targetPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(targetPath)) {
      const seedData = this.createSeedData();
      this.write(seedData);
    }
  }

  createSeedData() {
    const now = new Date().toISOString();
    const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const sellerPasswordHash = bcrypt.hashSync('Vendedor123!', 10);

    const adminId = 'usr-admin-001';
    const sellerId = 'usr-vend-002';

    return {
      users: [
        {
          id: adminId,
          nombre: 'Gezrel Misael Rivera',
          email: 'admin@poscore.mx',
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          departamento: 'Dirección de Operaciones POS',
          createdAt: now
        },
        {
          id: sellerId,
          nombre: 'Laura Méndez Torres',
          email: 'vendedor@poscore.mx',
          passwordHash: sellerPasswordHash,
          role: 'VENDEDOR',
          departamento: 'Ventas Corporativas',
          createdAt: now
        }
      ],
      products: [
        {
          id: 'pos-001',
          sku: 'PAX-A920PRO',
          nombre: 'Terminal Inteligente PAX A920 Pro',
          modelo: 'A920 Pro 4G + WiFi',
          marca: 'PAX Technology',
          categoria: 'Terminal Móvil Android',
          precioMxn: 6850.0,
          stock: 24,
          estado: 'DISPONIBLE',
          descripcion:
            'Terminal POS Android 10 con pantalla táctil HD 5.5", lector contactless NFC, chip EMV, cámara escáner 2D e impresora térmica integrada.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'pos-002',
          sku: 'ING-MOVE5000',
          nombre: 'Ingenico Move/5000 Inalámbrica',
          modelo: 'Move/5000 Dual-SIM',
          marca: 'Ingenico',
          categoria: 'Terminal Inalámbrica',
          precioMxn: 7490.0,
          stock: 15,
          estado: 'DISPONIBLE',
          descripcion:
            'Terminal bancaria portátil certificada PCI PTS v5 con conectividad 4G, WiFi y Bluetooth para restaurantes y comercios móviles.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'pos-003',
          sku: 'VER-V240M',
          nombre: 'Verifone V240m Plus',
          modelo: 'V240m 3G/4G/WiFi',
          marca: 'Verifone',
          categoria: 'Terminal Inalámbrica',
          precioMxn: 6290.0,
          stock: 4,
          estado: 'STOCK_BAJO',
          descripcion:
            'Dispositivo compacto de alto rendimiento con pantalla a color de 3.5", batería de larga duración y soporte Apple Pay / Google Pay.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'pos-004',
          sku: 'SUN-T2S-DUAL',
          nombre: 'Sunmi T2s Dual Screen Desktop POS',
          modelo: 'T2s 15.6" + 10.1"',
          marca: 'SUNMI',
          categoria: 'Punto de Venta Fijo',
          precioMxn: 14950.0,
          stock: 9,
          estado: 'DISPONIBLE',
          descripcion:
            'Estación de cobro de mostrador con doble pantalla táctil, impresora Seiko de 80mm integrada y procesador Octa-Core.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'pos-005',
          sku: 'NEW-N910PRO',
          nombre: 'Newland N910 Pro SmartPOS',
          modelo: 'N910 Pro EMV',
          marca: 'Newland',
          categoria: 'Terminal Móvil Android',
          precioMxn: 5890.0,
          stock: 18,
          estado: 'DISPONIBLE',
          descripcion:
            'SmartPOS ligero con Android 11, lectura ultrarrápida de QR/NFC y cifrado punto a punto P2PE.',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'pos-006',
          sku: 'ACC-DOCK-A920',
          nombre: 'Base de Carga Multipuerto L920',
          modelo: 'L920 Charging Base',
          marca: 'PAX Technology',
          categoria: 'Accesorio POS',
          precioMxn: 1350.0,
          stock: 3,
          estado: 'STOCK_BAJO',
          descripcion:
            'Estación de carga de escritorio con puerto Ethernet RJ45 y USB-C para terminales serie A920.',
          createdAt: now,
          updatedAt: now
        }
      ],
      quotes: [
        {
          id: 'cot-001',
          folio: 'COT-2026-0001',
          cliente: 'Carlos Alberto Domínguez',
          empresa: 'Grupo Gastronómico Pacífico S.A.',
          emailCliente: 'compras@grupopacifico.mx',
          items: [
            {
              productId: 'pos-001',
              sku: 'PAX-A920PRO',
              nombre: 'Terminal Inteligente PAX A920 Pro',
              cantidad: 6,
              precioUnitarioMxn: 6850.0,
              subtotalMxn: 41100.0
            },
            {
              productId: 'pos-006',
              sku: 'ACC-DOCK-A920',
              nombre: 'Base de Carga Multipuerto L920',
              cantidad: 6,
              precioUnitarioMxn: 1350.0,
              subtotalMxn: 8100.0
            }
          ],
          subtotalMxn: 49200.0,
          ivaMxn: 7872.0,
          totalMxn: 57072.0,
          tipoCambioUsd: 19.85,
          totalUsd: 2875.16,
          estado: 'ENVIADA',
          notas: 'Incluye configuración inicial de llaves bancarias y capacitación remota.',
          createdBy: 'Gezrel Misael Rivera',
          createdAt: now
        }
      ]
    };
  }

  read() {
    this.ensureInitialized();
    const raw = fs.readFileSync(this.getFilePath(), 'utf-8');
    return JSON.parse(raw);
  }

  write(data) {
    const targetPath = this.getFilePath();
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${targetPath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, targetPath);
  }

  reset() {
    const seedData = this.createSeedData();
    this.write(seedData);
    return seedData;
  }
}

export const db = new JsonDatabase();
