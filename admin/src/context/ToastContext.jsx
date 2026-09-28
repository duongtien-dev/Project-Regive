import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

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
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${
              toast.tone === 'danger'
                ? 'border-rose/20 bg-white text-rose'
                : toast.tone === 'info'
                  ? 'border-moss/20 bg-white text-forest'
                  : 'border-moss/20 bg-forest text-lime'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
