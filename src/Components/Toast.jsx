// src/components/Toast.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`${
          type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between max-w-md`}
      >
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 mr-3" />
          <div>
            <p className="font-semibold">Success!</p>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 text-white hover:opacity-80"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
