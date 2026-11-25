import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Cpu,
  Filter,
  Globe
} from 'lucide-react';
import { externalApi, productsApi } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import { formatMxn, formatUsd } from '../utils/format';
import ProductModal from '../components/ProductModal';
import ExchangeRateWidget from '../components/ExchangeRateWidget';

const STATUS_BADGE = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  STOCK_BAJO: 'bg-amber-100 text-amber-800 border-amber-200',
  AGOTADO: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function InventoryPage() {
  const { notify } = useNotification();

  const [products, setProducts] = useState([]);
  const [rateInfo, setRateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingRate, setRefreshingRate] = useState(false);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (estadoFilter) params.estado = estadoFilter;

      const res = await productsApi.list(params);
      setProducts(res.data.data || []);
    } catch (err) {
      notify({
        title: 'Error al listar inventario',
        message: err.response?.data?.message || 'No se pudieron cargar las terminales POS.',
        httpBadge: err.response?.data?.statusText || 'Error',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [search, estadoFilter, notify]);

  const fetchExchangeRate = useCallback(async (force = false) => {
    setRefreshingRate(true);
    try {
      const res = await externalApi.getExchangeRate(force);
      setRateInfo(res.data.data);
      if (force) {
        notify({
          title: 'Divisa actualizada',
          message: `1 USD = $${res.data.data.rateUsdToMxn.toFixed(2)} MXN`,
          httpBadge: res.data.statusText || '200 OK',
          variant: 'info'
        });
      }
    } catch {
      // Silencioso en carga inicial
    } finally {
      setRefreshingRate(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchExchangeRate(false);
  }, [fetchExchangeRate]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setServerErrors([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setServerErrors([]);
    setModalOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    setSubmitting(true);
    setServerErrors([]);
    try {
      if (editingProduct) {
        const res = await productsApi.update(editingProduct.id, payload);
        notify({
          title: 'Terminal POS actualizada',
          message: res.data.message,
          httpBadge: res.data.statusText || '200 OK',
          variant: 'success'
        });
      } else {
        const res = await productsApi.create(payload);
        notify({
          title: 'Terminal POS registrada',
          message: res.data.message,
          httpBadge: res.data.statusText || '201 Created',
          variant: 'success'
        });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      const statusText = err.response?.data?.statusText || '400 Bad Request';
      const msg = err.response?.data?.message || 'Error al guardar el dispositivo.';
      setServerErrors(err.response?.data?.errors || []);
      notify({
        title: 'Operación rechazada por la API',
        message: msg,
        httpBadge: statusText,
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `¿Eliminar la terminal "${product.nombre}" (SKU: ${product.sku}) del inventario?`
    );
    if (!confirmed) return;

    try {
      const res = await productsApi.remove(product.id);
      notify({
        title: 'Registro eliminado',
        message: res.data.message,
        httpBadge: res.data.statusText || '200 OK',
        variant: 'warning'
      });
      fetchProducts();
    } catch (err) {
      notify({
        title: 'Error al eliminar',
        message: err.response?.data?.message || 'No se pudo eliminar el registro.',
        httpBadge: err.response?.data?.statusText || 'Error',
        variant: 'error'
      });
    }
  };

  const usdRate = rateInfo?.rateUsdToMxn || 19.85;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Catálogo e Inventario de Terminales POS
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            API RESTful propia (<code className="font-mono-code text-xs">/api/products</code>)
            con operaciones CRUD completas y precios convertidos en vivo a USD.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Terminal POS
        </button>
      </div>

      {/* Banner de servicio externo */}
      <ExchangeRateWidget
        rateInfo={rateInfo}
        loading={refreshingRate}
        onRefresh={() => fetchExchangeRate(true)}
      />

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU, modelo o marca..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="STOCK_BAJO">Stock Bajo</option>
            <option value="AGOTADO">Agotado</option>
          </select>
        </div>
      </div>

      {/* Tabla CRUD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">SKU / Terminal</th>
                <th className="py-3.5 px-4">Marca y Categoría</th>
                <th className="py-3.5 px-4 text-right">Precio MXN</th>
                <th className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-indigo-700">
                    <Globe className="w-3.5 h-3.5" />
                    Precio USD (API Ext.)
                  </span>
                </th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Consultando API RESTful /api/products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No se encontraron terminales POS con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="py-4 px-5">
                      <span className="font-mono-code text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {product.sku}
                      </span>
                      <p className="font-bold text-slate-900 mt-1">{product.nombre}</p>
                      <p className="text-xs text-slate-500">{product.modelo}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800">{product.marca}</p>
                      <p className="text-xs text-slate-500">{product.categoria}</p>
                    </td>

                    <td className="py-4 px-4 text-right font-mono-code font-bold text-slate-900">
                      {formatMxn(product.precioMxn)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="font-mono-code font-bold text-indigo-700">
                        {formatUsd(product.precioMxn / usdRate)}
                      </span>
                      <span className="block text-[10px] text-slate-400">USD en vivo</span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono-code font-bold text-slate-800">
                      {product.stock}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          STATUS_BADGE[product.estado] ||
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {product.estado.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                          title="Editar (PUT)"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Eliminar (DELETE)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveProduct}
        initialProduct={editingProduct}
        submitting={submitting}
        serverErrors={serverErrors}
      />
    </div>
  );
}
