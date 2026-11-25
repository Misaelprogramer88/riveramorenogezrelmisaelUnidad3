import { useEffect, useState } from 'react';
import { X, Save, Cpu, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Terminal Móvil Android',
  'Terminal Inalámbrica',
  'Punto de Venta Fijo',
  'Lector Contactless / PIN Pad',
  'Accesorio POS'
];

const INITIAL_FORM = {
  sku: '',
  nombre: '',
  modelo: '',
  marca: '',
  categoria: 'Terminal Móvil Android',
  precioMxn: '',
  stock: '',
  descripcion: ''
};

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  submitting = false,
  serverErrors = []
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setClientError('');
      if (initialProduct) {
        setForm({
          sku: initialProduct.sku || '',
          nombre: initialProduct.nombre || '',
          modelo: initialProduct.modelo || '',
          marca: initialProduct.marca || '',
          categoria: initialProduct.categoria || CATEGORIES[0],
          precioMxn: String(initialProduct.precioMxn ?? ''),
          stock: String(initialProduct.stock ?? ''),
          descripcion: initialProduct.descripcion || ''
        });
      } else {
        setForm(INITIAL_FORM);
      }
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    if (!form.sku.trim() || !form.nombre.trim() || !form.modelo.trim() || !form.marca.trim()) {
      setClientError('Completa todos los campos obligatorios marcados con *.');
      return;
    }

    const precio = Number(form.precioMxn);
    const stock = Number(form.stock);

    if (!Number.isFinite(precio) || precio <= 0) {
      setClientError('El precio en MXN debe ser un número mayor a 0.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setClientError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }

    onSubmit({
      ...form,
      precioMxn: precio,
      stock
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialProduct ? 'Editar Terminal POS' : 'Registrar Nueva Terminal POS'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialProduct
                  ? `PUT /api/products/${initialProduct.id}`
                  : 'POST /api/products (validado con express-validator)'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(clientError || serverErrors.length > 0) && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Validación de datos
              </div>
              {clientError && <p>{clientError}</p>}
              {serverErrors.map((err, idx) => (
                <p key={idx}>
                  <strong className="font-mono-code">{err.field}:</strong> {err.message}
                </p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código SKU *
              </label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Ej. PAX-A920-PRO"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono-code uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marca *
              </label>
              <input
                name="marca"
                value={form.marca}
                onChange={handleChange}
                placeholder="Ej. PAX Technology, Ingenico..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Dispositivo / Terminal *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Terminal SmartPOS PAX A920 Pro"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modelo *
              </label>
              <input
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                placeholder="Ej. A920 Pro 4G + WiFi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Precio Unitario (MXN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                name="precioMxn"
                value={form.precioMxn}
                onChange={handleChange}
                placeholder="6850.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono-code focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Existencias en Stock *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono-code focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Especificaciones / Descripción
            </label>
            <textarea
              name="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Conectividad 4G/WiFi, lector NFC/EMV, impresora térmica..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting
                ? 'Guardando...'
                : initialProduct
                  ? 'Actualizar Terminal'
                  : 'Guardar Terminal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
