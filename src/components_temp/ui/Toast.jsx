
import React, { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";

const Toast = ({ toasts, onRemove }) => {
  // Auto-remove toasts after duration
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) => {
      return setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 2000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onRemove]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-gray-200 dark:bg-green-400 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-gray-100";
      case "error":
        return "text-red-800 dark:text-red-100";
      case "warning":
        return "text-yellow-800 dark:text-yellow-100";
      case "info":
        return "text-blue-800 dark:text-blue-100";
      default:
        return "text-blue-800 dark:text-blue-100";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <>
      
      <div 
        className="fixed top-4 right-4 z-[9999] pointer-events-none"
        style={{ 
          width: 'min(400px, calc(100vw - 2rem))',
          maxWidth: '100%'
        }}
      >
        <div className="flex flex-col gap-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`
                ${getBgColor(toast.type)} 
                ${getTextColor(toast.type)}
                border rounded-lg shadow-lg
                pointer-events-auto
                transform transition-all duration-300 ease-out
                animate-slide-in-right
                overflow-hidden
              `}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
              
                  <div className="flex-shrink-0">
                    {getIcon(toast.type)}
                  </div>

             
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {toast.title && (
                      <p className="text-sm font-semibold mb-1 break-words overflow-wrap-anywhere">
                        {toast.title}
                      </p>
                    )}
                    <p className="text-sm break-words overflow-wrap-anywhere">
                      {toast.message}
                    </p>
                  </div>

                  
                  <button
                    onClick={() => onRemove(toast.id)}
                    className="flex-shrink-0 inline-flex rounded-md hover:bg-black/5 dark:hover:bg-white/10 p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    aria-label="Close notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            
              {toast.showProgress && (
                <div className="h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-current opacity-50 animate-progress"
                    style={{ 
                      animationDuration: `${toast.duration || 5000}ms` 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Toast;