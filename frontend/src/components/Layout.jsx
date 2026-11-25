import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  FileSpreadsheet,
  ShieldCheck,
  Activity,
  LogOut,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { truncateJwt } from '../utils/format';
import SecurityStatusModal from './SecurityStatusModal';
import HttpMonitorDrawer from './HttpMonitorDrawer';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventario', label: 'Inventario POS', icon: Cpu },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileSpreadsheet }
];

export default function Layout({ children }) {
  const { user, token, logout } = useAuth();
  const { httpLogs } = useNotification();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [monitorOpen, setMonitorOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-950 text-slate-200 border-r border-slate-800 shrink-0">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white">
              POSCore <span className="text-indigo-400">ERP</span>
            </h1>
            <p className="text-[11px] text-slate-400">Terminales Punto de Venta</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Tarjeta resumen de seguridad en el sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="w-full text-left p-3 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400/60 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Sesión Protegida
              </span>
              <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                JWT
              </span>
            </div>
            <p className="font-mono-code text-[10px] text-slate-400 mt-1.5 truncate">
              {truncateJwt(token)}
            </p>
            <p className="text-[11px] text-indigo-300 mt-1 group-hover:underline">
              Ver estado de seguridad →
            </p>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-rose-600/90 transition"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="w-64 bg-slate-950 text-slate-200 flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-extrabold text-white">POSCore ERP</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1.5">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-rose-400"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
          <div
            className="flex-1 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sistema de Gestión de Inventario y Cotizaciones de Terminales POS
              </p>
              <p className="text-sm font-bold text-slate-900 sm:hidden">POSCore ERP</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Botón Estado de Seguridad */}
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Estado de Seguridad</span>
              <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                {user?.role}
              </span>
            </button>

            {/* Botón Monitor HTTP */}
            <button
              onClick={() => setMonitorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
              title="Ver registro de respuestas HTTP de los Web Services"
            >
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Monitor HTTP</span>
              <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                {httpLogs.length}
              </span>
            </button>

            {/* Perfil usuario */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {user?.nombre?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">{user?.nombre}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <SecurityStatusModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
      <HttpMonitorDrawer
        isOpen={monitorOpen}
        onClose={() => setMonitorOpen(false)}
      />
    </div>
  );
}
