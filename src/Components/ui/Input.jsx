// src/components/ui/Input.jsx
import React from "react";

const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          className={`
            block w-full rounded-lg border 
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            }
            ${leftIcon ? "pl-10" : "pl-3"}
            ${rightIcon ? "pr-10" : "pr-3"}
            py-2.5
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2
            transition-colors duration-200
            ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
