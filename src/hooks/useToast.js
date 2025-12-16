// src/hooks/useToast.js
import { useState, useCallback } from "react";

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => {
      showToast(message, "success", duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message, duration) => {
      showToast(message, "error", duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message, duration) => {
      showToast(message, "warning", duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message, duration) => {
      showToast(message, "info", duration);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };
};

export default useToast;
