import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Trash2,
  Building2,
  Mail,
  Globe,
  User
} from 'lucide-react';
import { externalApi, productsApi, quotesApi } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import { formatDateTime, formatMxn, formatUsd } from '../utils/format';
import QuoteModal from '../components/QuoteModal';

const QUOTE_STATUS_STYLE = {
  BORRADOR: 'bg-slate-100 text-slate-700 border-slate-200',
  ENVIADA: 'bg-sky-100 text-sky-800 border-sky-200',
  APROBADA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  RECHAZADA: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function QuotesPage() {
  const { notify } = useNotification();

  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(19.85);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, pRes, rRes] = await Promise.all([
        quotesApi.list(),
        productsApi.list(),
        externalApi.getExchangeRate(false)
      ]);
      setQuotes(qRes.data.data || []);
      setProducts(pRes.data.data || []);
      if (rRes.data.data?.rateUsdToMxn) {
        setExchangeRate(rRes.data.data.rateUsdToMxn);
      }
    } catch (err) {
      notify({
        title: 'Error cargando cotizaciones',
        message: err.response?.data?.message || 'No se pudieron recuperar las cotizaciones.',
        httpBadge: err.response?.data?.statusText || 'Error',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateQuote = async (payload) => {
    setSubmitting(true);
    try {
      const res = await quotesApi.create(payload);
      notify({
        title: 'Cotización generada',
        message: res.data.message,
        httpBadge: res.data.statusText || '201 Created',
        variant: 'success'
      });
      setModalOpen(false);
      loadData();
    } catch (err) {
      notify({
        title: 'Error al crear cotización',
        message: err.response?.data?.message || 'Verifica los campos ingresados.',
        httpBadge: err.response?.data?.statusText || '400 Bad Request',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (quote, newStatus) => {
    try {
      const res = await quotesApi.updateStatus(quote.id, newStatus);
      notify({
        title: 'Estado actualizado',
        message: res.data.message,
        httpBadge: res.data.statusText || '200 OK',
        variant: 'info'
      });
      setQuotes((prev) =>
        prev.map((q) => (q.id === quote.id ? res.data.data : q))
      );
    } catch (err) {
      notify({
        title: 'Error al cambiar estado',
        message: err.response?.data?.message || 'No se pudo actualizar el estado.',
        variant: 'error'
      });
    }
  };

  const handleDelete = async (quote) => {
    if (!window.confirm(`¿Eliminar la cotización ${quote.folio}?`)) return;
    try {
      const res = await quotesApi.remove(quote.id);
      notify({
        title: 'Cotización eliminada',
        message: res.data.message,
        httpBadge: res.data.statusText || '200 OK',
        variant: 'warning'
      });
      setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    } catch (err) {
      notify({
        title: 'Error al eliminar',
        message: err.response?.data?.message || 'No se pudo eliminar la cotización.',
        variant: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Cotizaciones Corporativas POS
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Generación de propuestas comerciales con cálculo automático de IVA 16% y conversión
            USD mediante ExchangeRate-API.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Cotización
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          Cargando cotizaciones...
        </div>
      ) : quotes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          No hay cotizaciones registradas todavía. Crea la primera haciendo clic en “Nueva
          Cotización”.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono-code text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                      {quote.folio}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        QUOTE_STATUS_STYLE[quote.estado] || QUOTE_STATUS_STYLE.BORRADOR
                      }`}
                    >
                      {quote.estado}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(quote.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {quote.empresa}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {quote.cliente}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {quote.emailCliente}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    value={quote.estado}
                    onChange={(e) => handleStatusChange(quote, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="BORRADOR">BORRADOR</option>
                    <option value="ENVIADA">ENVIADA</option>
                    <option value="APROBADA">APROBADA</option>
                    <option value="RECHAZADA">RECHAZADA</option>
                  </select>
                  <button
                    onClick={() => handleDelete(quote)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Eliminar cotización"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Partidas */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="py-2 text-left">SKU</th>
                      <th className="py-2 text-left">Terminal POS</th>
                      <th className="py-2 text-center">Cant.</th>
                      <th className="py-2 text-right">Precio Unit.</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-mono-code text-slate-600">{item.sku}</td>
                        <td className="py-2.5 font-semibold text-slate-800">{item.nombre}</td>
                        <td className="py-2.5 text-center font-mono-code">{item.cantidad}</td>
                        <td className="py-2.5 text-right font-mono-code text-slate-600">
                          {formatMxn(item.precioUnitarioMxn)}
                        </td>
                        <td className="py-2.5 text-right font-mono-code font-bold text-slate-900">
                          {formatMxn(item.subtotalMxn)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 max-w-md">
                  {quote.notas && (
                    <p>
                      <strong className="text-slate-700">Notas:</strong> {quote.notas}
                    </p>
                  )}
                  <p className="mt-1">Elaborada por: {quote.createdBy}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">
                      Subtotal
                    </span>
                    <span className="font-mono-code text-xs font-semibold text-slate-700">
                      {formatMxn(quote.subtotalMxn)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">
                      IVA 16%
                    </span>
                    <span className="font-mono-code text-xs font-semibold text-slate-700">
                      {formatMxn(quote.ivaMxn)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">
                      Total MXN
                    </span>
                    <span className="font-mono-code text-sm font-extrabold text-slate-900">
                      {formatMxn(quote.totalMxn)}
                    </span>
                  </div>
                  <div className="pl-4 border-l border-slate-200">
                    <span className="flex items-center gap-1 text-[10px] uppercase text-indigo-600 font-bold">
                      <Globe className="w-3 h-3" />
                      Total USD (TC ${Number(quote.tipoCambioUsd).toFixed(2)})
                    </span>
                    <span className="font-mono-code text-sm font-extrabold text-indigo-700">
                      {formatUsd(quote.totalUsd)} USD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateQuote}
        products={products}
        exchangeRate={exchangeRate}
        submitting={submitting}
      />
    </div>
  );
}
