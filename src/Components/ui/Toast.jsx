// src/components/ui/Toast.jsx
import React from "react";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";

const Toast = ({ toasts, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  return (
   <div className="fixed top-4 right-4 z-50 space-y-3 max-w-[calc(100vw-2rem)]">

      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getBgColor(toast.type)} 
            ${getTextColor(toast.type)}
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            w-full max-w-sm
            transform transition-all duration-300
            animate-slide-in-right
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{getIcon(toast.type)}</div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => onRemove(toast.id)}
                  className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
