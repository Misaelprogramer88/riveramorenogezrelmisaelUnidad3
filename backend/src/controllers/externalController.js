import { exchangeRateService } from '../services/exchangeRateService.js';

export const externalController = {
  async getExchangeRate(req, res, next) {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const rateData = await exchangeRateService.getUsdToMxnRate({ forceRefresh });
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusText: '200 OK',
        message: rateData.live
          ? `Tipo de cambio obtenido en tiempo real desde ${rateData.sourceName}.`
          : 'Tipo de cambio servido desde respaldo local (sin conectividad externa).',
        data: rateData
      });
    } catch (error) {
      return next(error);
    }
  }
};
