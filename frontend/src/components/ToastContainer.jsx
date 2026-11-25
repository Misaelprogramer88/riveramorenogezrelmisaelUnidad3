import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const VARIANT_STYLES = {
  success: {
    border: 'border-emerald-200 bg-white',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  error: {
    border: 'border-rose-200 bg-white',
    icon: XCircle,
    iconColor: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  warning: {
    border: 'border-amber-200 bg-white',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  info: {
    border: 'border-indigo-200 bg-white',
    icon: Info,
    iconColor: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg shadow-slate-900/10 ${style.border}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.iconColor}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.httpBadge && (
                  <span
                    className={`font-mono-code text-[11px] font-semibold px-2 py-0.5 rounded-md border ${style.badge}`}
                  >
                    {toast.httpBadge}
                  </span>
                )}
              </div>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
