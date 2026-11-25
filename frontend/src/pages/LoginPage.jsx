import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@poscore.mx');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await login({ email, password });
      notify({
        title: 'Autenticación exitosa',
        message: `Bienvenido(a), ${response.data.user.nombre}. Token JWT activo.`,
        httpBadge: response.statusText || '200 OK',
        variant: 'success'
      });
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'No se pudo iniciar sesión. Verifica que el backend esté activo.';
      setError(msg);
      notify({
        title: 'Acceso rechazado',
        message: msg,
        httpBadge: err.response?.data?.statusText || '401 Unauthorized',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Panel informativo izquierdo */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              POSCore <span className="text-indigo-400">ERP</span>
            </h1>
            <p className="text-xs text-slate-400">
              Inventario y Cotizaciones de Terminales Punto de Venta
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            Arquitectura Limpia + Seguridad JWT/Bcrypt
          </span>
          <h2 className="text-3xl font-extrabold leading-tight">
            Control total sobre tu catálogo de Terminales POS y cotizaciones corporativas.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Plataforma Full-Stack construida con Node.js, Express, React y Vite aplicando el
            patrón Repository/Service, validación estricta y consumo en tiempo real de tipo de
            cambio USD/MXN.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            {[
              'Autenticación JWT (HS256)',
              'Hash Bcrypt (10 rounds)',
              'Helmet + CORS + Validator',
              'API REST + ExchangeRate API'
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          Caso de Estudio Unidad 3 · Arquitectura Web y Web Services
        </p>
      </div>

      {/* Formulario derecho */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 p-8">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-slate-900">POSCore ERP</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Iniciar Sesión</h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingresa tus credenciales para obtener tu token JWT y acceder al sistema.
            </p>
          </div>

          {/* Accesos rápidos de demostración */}
          <div className="mb-5 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 mb-2">
              Cuentas Demo Precargadas (Bcrypt)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@poscore.mx', 'Admin123!')}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
              >
                Admin: admin@poscore.mx
              </button>
              <button
                type="button"
                onClick={() => fillDemo('vendedor@poscore.mx', 'Vendedor123!')}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition"
              >
                Vendedor: vendedor@poscore.mx
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@poscore.mx"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-60"
            >
              {submitting ? 'Verificando credenciales...' : 'Ingresar al Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            ¿No tienes cuenta todavía?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Registrar nuevo usuario
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
