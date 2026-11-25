import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  PackageCheck,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { externalApi, productsApi, quotesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatMxn, formatUsd, truncateJwt } from '../utils/format';
import ExchangeRateWidget from '../components/ExchangeRateWidget';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { notify } = useNotification();

  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [rateInfo, setRateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingRate, setRefreshingRate] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, quotesRes, rateRes] = await Promise.all([
        productsApi.list(),
        quotesApi.list(),
        externalApi.getExchangeRate(false)
      ]);
      setProducts(prodRes.data.data || []);
      setSummary(prodRes.data.meta || null);
      setQuotes(quotesRes.data.data || []);
      setRateInfo(rateRes.data.data || null);
    } catch (err) {
      notify({
        title: 'Error cargando dashboard',
        message: err.response?.data?.message || 'No se pudieron obtener los datos.',
        httpBadge: err.response?.data?.statusText || 'Error',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefreshRate = async () => {
    setRefreshingRate(true);
    try {
      const res = await externalApi.getExchangeRate(true);
      setRateInfo(res.data.data);
      notify({
        title: 'Tipo de cambio actualizado',
        message: `1 USD = $${res.data.data.rateUsdToMxn.toFixed(2)} MXN (${res.data.data.sourceName})`,
        httpBadge: res.data.statusText || '200 OK',
        variant: 'info'
      });
    } catch (err) {
      notify({
        title: 'Error en API externa',
        message: err.response?.data?.message || 'No se pudo actualizar el tipo de cambio.',
        variant: 'error'
      });
    } finally {
      setRefreshingRate(false);
    }
  };

  const rate = rateInfo?.rateUsdToMxn || 19.85;
  const inventoryValueUsd = summary ? summary.totalValueMxn / rate : 0;
  const lowStockItems = products.filter((p) => p.stock <= 5);

  return (
    <div className="space-y-6">
      {/* Saludo y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Panel de Control POSCore
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Resumen operativo de inventario de terminales punto de venta, cotizaciones y
            servicios web integrados.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/inventario"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            Gestionar Inventario
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/cotizaciones"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
          >
            Ver Cotizaciones
          </Link>
        </div>
      </div>

      {/* Widget Web Service de Terceros */}
      <ExchangeRateWidget
        rateInfo={rateInfo}
        loading={refreshingRate}
        onRefresh={handleRefreshRate}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Modelos POS Activos</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : summary?.totalModels ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary?.totalUnits ?? 0} unidades totales en almacén
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Valor de Inventario
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3 font-mono-code">
            {loading ? '...' : formatMxn(summary?.totalValueMxn || 0)}
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1 font-mono-code">
            ≈ {formatUsd(inventoryValueUsd)} USD (en tiempo real)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Alertas Stock Bajo</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : (summary?.lowStockCount ?? 0) + (summary?.outOfStockCount ?? 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Terminales con 5 o menos unidades
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cotizaciones</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">
            {loading ? '...' : quotes.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cotizaciones corporativas registradas
          </p>
        </div>
      </div>

      {/* Dos columnas: Tarjeta visible de Seguridad + Alertas de Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel visible de Estado de Seguridad */}
        <div className="rounded-2xl bg-slate-900 text-white p-6 shadow-md border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Estado de Seguridad Activo</h2>
                <p className="text-xs text-slate-400">
                  Mecanismos de protección en ejecución
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              PROTEGIDA
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Token JWT Activo (Truncado)
              </span>
              <code className="font-mono-code text-emerald-400 break-all">
                Bearer {truncateJwt(token)}
              </code>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Rol Autenticado</span>
                <span className="font-bold text-indigo-300 text-sm">{user?.role}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Hash Contraseñas</span>
                <span className="font-bold text-white text-sm">bcrypt (10 rounds)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Haz clic en el botón <strong className="text-white">“Estado de Seguridad”</strong> en la
            barra superior para auditar el payload JWT o probar el bloqueo HTTP 401 sin token.
          </p>
        </div>

        {/* Alertas de reposición */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-indigo-600" />
              Terminales con Prioridad de Reposición
            </h2>
            <Link
              to="/inventario"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Ver catálogo →
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
              Todo el inventario de terminales POS cuenta con niveles óptimos de stock.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.nombre}</p>
                    <p className="text-xs text-slate-600">
                      SKU: <span className="font-mono-code">{item.sku}</span> · {item.modelo}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {item.stock} en stock
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono-code">
                      {formatMxn(item.precioMxn)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
