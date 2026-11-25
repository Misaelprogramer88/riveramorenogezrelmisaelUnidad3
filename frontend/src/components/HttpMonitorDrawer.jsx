import { Activity, Trash2, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { formatDateTime } from '../utils/format';

const METHOD_BADGES = {
  GET: 'bg-sky-100 text-sky-800 border-sky-200',
  POST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PUT: 'bg-amber-100 text-amber-800 border-amber-200',
  PATCH: 'bg-violet-100 text-violet-800 border-violet-200',
  DELETE: 'bg-rose-100 text-rose-800 border-rose-200'
};

export default function HttpMonitorDrawer({ isOpen, onClose }) {
  const { httpLogs, clearHttpLogs } = useNotification();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold">Monitor de Web Services (HTTP Log)</h2>
              <p className="text-[11px] text-slate-300">
                Historial en vivo de peticiones REST y códigos de respuesta HTTP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {httpLogs.length > 0 && (
              <button
                onClick={clearHttpLogs}
                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50">
          {httpLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Aún no se han registrado peticiones HTTP en esta sesión.
            </div>
          ) : (
            httpLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border ${
                        METHOD_BADGES[log.method] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="font-mono-code text-xs text-slate-800 truncate font-medium">
                      /api{log.url}
                    </span>
                  </div>
                  <span
                    className={`font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      log.ok
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {log.statusText}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{log.message}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatDateTime(log.timestamp)}</span>
                  <span className="font-mono-code">{log.durationMs} ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
