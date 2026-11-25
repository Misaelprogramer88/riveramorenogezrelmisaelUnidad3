import { env } from '../config/env.js';

/**
 * Servicio de integración con Web Services de Terceros (Tipo de Cambio USD/MXN).
 * Consume ExchangeRate-API en tiempo real con respaldo automático a Frankfurter API.
 */
export class ExchangeRateService {
  constructor() {
    this.cache = null;
    this.cacheTtlMs = 5 * 60 * 1000; // 5 minutos
  }

  async getUsdToMxnRate({ forceRefresh = false } = {}) {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cache &&
      now - this.cache.cachedAtMs < this.cacheTtlMs
    ) {
      return {
        ...this.cache.payload,
        cacheHit: true
      };
    }

    // 1. Proveedor principal: ExchangeRate-API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(env.exchangeApiUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        const mxnRate = Number(json?.rates?.MXN);

        if (mxnRate && Number.isFinite(mxnRate)) {
          const payload = {
            base: 'USD',
            target: 'MXN',
            rateUsdToMxn: Number(mxnRate.toFixed(4)),
            rateMxnToUsd: Number((1 / mxnRate).toFixed(6)),
            date: json.date || new Date().toISOString().slice(0, 10),
            fetchedAt: new Date().toISOString(),
            sourceName: 'ExchangeRate-API (API Pública Externa)',
            sourceUrl: env.exchangeApiUrl,
            providerStatus: `HTTP ${response.status} OK`,
            live: true,
            cacheHit: false
          };
          this.cache = { payload, cachedAtMs: now };
          return payload;
        }
      }
    } catch {
      // Continúa al proveedor de respaldo
    }

    // 2. Proveedor secundario: Frankfurter API
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(env.exchangeFallbackUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const json = await response.json();
        const mxnRate = Number(json?.rates?.MXN);

        if (mxnRate && Number.isFinite(mxnRate)) {
          const payload = {
            base: 'USD',
            target: 'MXN',
            rateUsdToMxn: Number(mxnRate.toFixed(4)),
            rateMxnToUsd: Number((1 / mxnRate).toFixed(6)),
            date: json.date || new Date().toISOString().slice(0, 10),
            fetchedAt: new Date().toISOString(),
            sourceName: 'Frankfurter API (Banco Central Europeo)',
            sourceUrl: env.exchangeFallbackUrl,
            providerStatus: `HTTP ${response.status} OK`,
            live: true,
            cacheHit: false
          };
          this.cache = { payload, cachedAtMs: now };
          return payload;
        }
      }
    } catch {
      // Continúa al respaldo local si no hay conectividad
    }

    // 3. Respaldo seguro si no hay conexión a internet
    const fallbackRate = this.cache?.payload?.rateUsdToMxn || 19.85;
    return {
      base: 'USD',
      target: 'MXN',
      rateUsdToMxn: fallbackRate,
      rateMxnToUsd: Number((1 / fallbackRate).toFixed(6)),
      date: new Date().toISOString().slice(0, 10),
      fetchedAt: new Date().toISOString(),
      sourceName: 'ExchangeRate-API (Modo Respaldo Local)',
      sourceUrl: env.exchangeApiUrl,
      providerStatus: 'OFFLINE_FALLBACK',
      live: false,
      cacheHit: false
    };
  }
}

export const exchangeRateService = new ExchangeRateService();
