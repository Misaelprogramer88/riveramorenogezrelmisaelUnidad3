import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, FileText, Globe } from 'lucide-react';
import { formatMxn, formatUsd } from '../utils/format';

export default function QuoteModal({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  exchangeRate = 19.85,
  submitting = false
}) {
  const [cliente, setCliente] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState([{ productId: '', cantidad: 1 }]);

  useEffect(() => {
    if (isOpen) {
      setCliente('');
      setEmpresa('');
      setEmailCliente('');
      setNotas('');
      setItems([
        {
          productId: products[0]?.id || '',
          cantidad: 2
        }
      ]);
    }
  }, [isOpen, products]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return sum;
      return sum + prod.precioMxn * (Number(item.cantidad) || 0);
    }, 0);
    const iva = subtotal * 0.16;
    const totalMxn = subtotal + iva;
    const totalUsd = exchangeRate > 0 ? totalMxn / exchangeRate : 0;
    return { subtotal, iva, totalMxn, totalUsd };
  }, [items, products, exchangeRate]);

  if (!isOpen) return null;

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: products[0]?.id || '', cantidad: 1 }
    ]);
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items
      .filter((i) => i.productId && Number(i.cantidad) > 0)
      .map((i) => ({ productId: i.productId, cantidad: Number(i.cantidad) }));

    if (validItems.length === 0) return;

    onSubmit({
      cliente,
      empresa,
      emailCliente,
      notas,
      items: validItems
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nueva Cotización de Terminales POS
              </h2>
              <p className="text-xs text-slate-500">
                POST /api/quotes · Incluye cálculo de IVA 16% y conversión USD en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Cliente *
              </label>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej. Ana Sofía Morales"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Empresa / Razón Social *
              </label>
              <input
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ej. Comercializadora del Bajío S.A."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico del Cliente *
            </label>
            <input
              type="email"
              value={emailCliente}
              onChange={(e) => setEmailCliente(e.target.value)}
              placeholder="compras@empresa.mx"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Terminales POS a Cotizar *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar partida
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Selecciona una terminal...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.nombre} — {formatMxn(p.precioMxn)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={item.cantidad}
                  onChange={(e) => updateItem(idx, 'cantidad', e.target.value)}
                  className="w-24 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono-code text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas comerciales
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Tiempo de entrega, garantía, configuración inicial..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Resumen financiero */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Subtotal (MXN)</span>
              <span className="font-mono-code">{formatMxn(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>IVA (16%)</span>
              <span className="font-mono-code">{formatMxn(totals.iva)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold">Total MXN</span>
              <span className="text-lg font-extrabold font-mono-code text-emerald-400">
                {formatMxn(totals.totalMxn)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-300 pt-1">
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Equivalente USD (TC: ${exchangeRate.toFixed(2)} MXN)
              </span>
              <span className="font-mono-code font-bold text-white">
                {formatUsd(totals.totalUsd)} USD
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Generando...' : 'Generar Cotización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
