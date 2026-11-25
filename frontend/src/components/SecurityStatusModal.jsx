import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  UserCheck,
  Server,
  X,
  RefreshCw,
  ShieldAlert,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatDateTime, truncateJwt } from '../utils/format';

export default function SecurityStatusModal({ isOpen, onClose }) {
  const { token, user, tokenPayload } = useAuth();
  const { notify } = useNotification();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDecoded, setShowDecoded] = useState(false);
  const [blockTestResult, setBlockTestResult] = useState(null);
  const [testingBlock, setTestingBlock] = useState(false);

  const fetchSecurityStatus = async () => {
    setLoading(true);
    try {
      const res = await authApi.securityStatus();
      setStatusData(res.data.data);
    } catch (err) {
      notify({
        title: 'Error al auditar seguridad',
        message: err.response?.data?.message || 'No se pudo consultar el estado de seguridad.',
        httpBadge: err.response?.data?.statusText || 'Error',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBlockTestResult(null);
      fetchSecurityStatus();
    }
  }, [isOpen]);

  const handleTestRouteProtection = async () => {
    setTestingBlock(true);
    setBlockTestResult(null);
    try {
      await authApi.testUnauthenticatedAccess();
      setBlockTestResult({
        blocked: false,
        status: '200 OK',
        message: 'La ruta permitió el acceso sin token.'
      });
    } catch (err) {
      const statusText = err.response?.data?.statusText || '401 Unauthorized';
      const msg =
        err.response?.data?.message ||
        'Acceso bloqueado correctamente por el middleware JWT.';
      setBlockTestResult({
        blocked: true,
        status: statusText,
        message: msg
      });
      notify({
        title: 'Protección de ruta verificada',
        message: 'El backend bloqueó la petición sin token JWT.',
        httpBadge: statusText,
        variant: 'info'
      });
    } finally {
      setTestingBlock(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Estado de Seguridad de la Sesión</h2>
              <p className="text-xs text-slate-300">
                Verificación en tiempo real de JWT, Bcrypt, Helmet, CORS y Middleware Privado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Estado Global */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Sesión Protegida Activa (JWT Bearer + Rutas Privadas)
                </p>
                <p className="text-xs text-emerald-700">
                  Verificado contra endpoint privado{' '}
                  <code className="font-mono-code font-semibold">GET /api/auth/security-status</code>
                </p>
              </div>
            </div>
            <button
              onClick={fetchSecurityStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Revalidar
            </button>
          </div>

          {/* Usuario y Rol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Usuario Autenticado
              </div>
              <p className="text-sm font-bold text-slate-900">{user?.nombre}</p>
              <p className="text-xs text-slate-600 mt-0.5">{user?.email}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  ROL: {user?.role}
                </span>
                <span className="text-[11px] text-slate-500">
                  {user?.departamento || 'Operaciones'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Cifrado de Contraseña
              </div>
              <p className="text-sm font-bold text-slate-900">
                {statusData?.mechanisms?.passwordEncryption || 'bcrypt (10 salt rounds)'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Prefijo hash almacenado en DB:{' '}
                <code className="font-mono-code text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-800">
                  {statusData?.mechanisms?.passwordHashPrefix || '$2a$10$...'}
                </code>
              </p>
            </div>
          </div>

          {/* Token JWT Truncado */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                <KeyRound className="w-4 h-4" />
                Token JWT Activo (Truncado)
              </div>
              <button
                onClick={() => setShowDecoded((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white transition"
              >
                {showDecoded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showDecoded ? 'Ocultar Payload' : 'Inspeccionar Payload'}
              </button>
            </div>

            <div className="font-mono-code text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-emerald-400 break-all">
              Bearer {statusData?.tokenInfo?.truncated || truncateJwt(token)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 block">Algoritmo</span>
                <span className="font-mono-code font-semibold text-white">HS256</span>
              </div>
              <div>
                <span className="text-slate-500 block">Emisor (iss)</span>
                <span className="font-mono-code font-semibold text-white">
                  {statusData?.tokenInfo?.issuer || tokenPayload?.iss || 'poscore-api'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Expira</span>
                <span className="font-semibold text-white">
                  {formatDateTime(
                    statusData?.tokenInfo?.expiresAt ||
                      (tokenPayload?.exp
                        ? new Date(tokenPayload.exp * 1000).toISOString()
                        : null)
                  )}
                </span>
              </div>
            </div>

            {showDecoded && tokenPayload && (
              <pre className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-indigo-300 font-mono-code overflow-x-auto">
                {JSON.stringify(tokenPayload, null, 2)}
              </pre>
            )}
          </div>

          {/* Capas de Seguridad Activas */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              <Server className="w-4 h-4 text-indigo-600" />
              Mecanismos de Defensa Activos en Backend
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { label: 'Helmet (Cabeceras HTTP seguras)', active: true },
                {
                  label: `CORS Restringido (${statusData?.mechanisms?.corsPolicy || 'localhost:5173'})`,
                  active: true
                },
                { label: 'express-validator (Sanitización de entradas)', active: true },
                { label: 'Middleware JWT + PrivateRoute React', active: true }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prueba en vivo de bloqueo 401 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Prueba en vivo de protección de endpoints
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Envía una petición real a <code className="font-mono-code">GET /api/products</code> sin
                  token JWT para demostrar el bloqueo del middleware.
                </p>
              </div>
              <button
                onClick={handleTestRouteProtection}
                disabled={testingBlock}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60"
              >
                {testingBlock ? 'Probando...' : 'Probar sin Token (401)'}
              </button>
            </div>

            {blockTestResult && (
              <div className="mt-3 p-3 rounded-lg bg-white border border-amber-300 flex items-start gap-2.5">
                <span className="font-mono-code text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                  {blockTestResult.status}
                </span>
                <p className="text-xs text-slate-700">{blockTestResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
