import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let externalPush = null; // lets non-React code (client.js) trigger toasts

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, tone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    // auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // expose pushToast to plain JS modules
  externalPush = pushToast;

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 9999,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "var(--paper-raised, #fff)",
              border: "1px solid var(--line, #e3ddd0)",
              borderLeft: `3px solid ${
                t.tone === "alert"
                  ? "var(--rust, #a8472f)"
                  : t.tone === "warning"
                  ? "var(--amber, #93661f)"
                  : "var(--green, #2f4d3a)"
              }`,
              borderRadius: 8,
              padding: "12px 16px",
              minWidth: 260,
              maxWidth: 340,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 14,
              color: "var(--ink, #2a2622)",
              animation: "toastIn 0.25s ease",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Called from client.js (outside React) to show a toast.
export function showToast(message, tone = "info") {
  if (externalPush) externalPush(message, tone);
}
