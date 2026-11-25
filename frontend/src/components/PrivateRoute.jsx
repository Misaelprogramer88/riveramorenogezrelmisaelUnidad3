import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

/**
 * Componente de Ruta Privada en Frontend.
 * Impide el acceso al dashboard si no existe una sesión JWT válida.
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 gap-3">
        <ShieldCheck className="w-10 h-10 text-indigo-400 animate-pulse" />
        <p className="text-sm font-medium tracking-wide">
          Verificando sesión protegida JWT...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
