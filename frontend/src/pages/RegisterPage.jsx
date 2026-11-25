import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  User,
  Mail,
  Lock,
  Building2,
  ShieldCheck,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'VENDEDOR',
    departamento: 'Ventas Corporativas'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setSubmitting(true);

    try {
      const response = await register(form);
      notify({
        title: 'Usuario registrado',
        message: 'Contraseña cifrada con bcrypt y sesión JWT iniciada.',
        httpBadge: response.statusText || '201 Created',
        variant: 'success'
      });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar usuario.';
      setError(msg);
      setFieldErrors(err.response?.data?.errors || []);
      notify({
        title: 'Error en registro',
        message: msg,
        httpBadge: err.response?.data?.statusText || '400 Bad Request',
        variant: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Crear Cuenta</h1>
            <p className="text-xs text-slate-500">
              Registro seguro con encriptación bcrypt y emisión automática de JWT
            </p>
          </div>
        </div>

        {(error || fieldErrors.length > 0) && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
            {fieldErrors.map((fe, idx) => (
              <p key={idx}>
                <strong className="font-mono-code">{fe.field}:</strong> {fe.message}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. María Fernanda López"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@empresa.mx"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña (mínimo 6 caracteres) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rol del Usuario
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="VENDEDOR">VENDEDOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="departamento"
                  value={form.departamento}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Tu contraseña será hasheada con <strong>bcrypt (10 salt rounds)</strong> antes de
              guardarse en el repositorio.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Registrando cuenta...' : 'Registrar y Acceder'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
