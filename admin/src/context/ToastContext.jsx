import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TONE_META = {
  ok: { icon: Check, className: 'border-moss/20 bg-forest text-lime' },
  info: { icon: Info, className: 'border-moss/20 bg-white text-forest' },
  danger: { icon: AlertTriangle, className: 'border-rose/20 bg-white text-rose' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'ok') => {
      const id = crypto.randomUUID();
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3600);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message) => push(message, 'ok'),
      error: (message) => push(message, 'danger'),
      info: (message) => push(message, 'info'),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const meta = TONE_META[toast.tone] || TONE_META.ok;
          const Icon = meta.icon;
          return (
            <div
              key={toast.id}
              className={`animate-toast-in pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${meta.className}`}
            >
              <div className="flex items-start gap-2.5">
                <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                <p className="flex-1">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Đóng thông báo"
                  className="-mr-1 shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
