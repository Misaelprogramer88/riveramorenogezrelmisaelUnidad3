import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret:
    process.env.JWT_SECRET ||
    'POSCore_Enterprise_JWT_Secret_2026_DesarrolloSeguro',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  exchangeApiUrl:
    process.env.EXCHANGE_API_URL ||
    'https://api.exchangerate-api.com/v4/latest/USD',
  exchangeFallbackUrl:
    'https://api.frankfurter.app/latest?from=USD&to=MXN',
  dbFile:
    process.env.DB_FILE ||
    path.resolve(__dirname, '../../data/db.json')
};
