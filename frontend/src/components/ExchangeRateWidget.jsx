import { Globe, RefreshCw, ArrowRightLeft, ExternalLink } from 'lucide-react';
import { formatDateTime } from '../utils/format';

export default function ExchangeRateWidget({ rateInfo, loading, onRefresh }) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                Web Service de Terceros
              </span>
              {rateInfo && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    rateInfo.live
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      rateInfo.live ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {rateInfo.live
                    ? `En tiempo real · ${rateInfo.providerStatus}`
                    : 'Respaldo Local'}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5">
              Conversión Automática de Precios MXN ↔ USD
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-1">
              <span>Fuente externa:</span>
              <span className="font-semibold text-slate-800">
                {rateInfo?.sourceName || 'ExchangeRate-API'}
              </span>
              {rateInfo?.sourceUrl && (
                <a
                  href={rateInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 font-mono-code text-[11px] text-indigo-600 hover:underline ml-1"
                >
                  {rateInfo.sourceUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500" />
              Tipo de cambio vigente
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900 font-mono-code">
                1 USD = ${rateInfo ? rateInfo.rateUsdToMxn.toFixed(2) : '--.--'} MXN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Consultado: {rateInfo ? formatDateTime(rateInfo.fetchedAt) : 'Cargando...'}
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar API Externa
          </button>
        </div>
      </div>
    </div>
  );
}
