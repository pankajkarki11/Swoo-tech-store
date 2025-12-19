// src/components/ui/Button.jsx
import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  icon = null,
  iconPosition = "left",
  iconOnly = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700",
    teal: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white rounded-full font-semibold hover:shadow-lg transition hover:scale-105 border-rounded",
    cart: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white rounded-lg font-semibold hover:shadow-lg transition hover:scale-105 border-rounded",
    overlay:
      "mb-6 bg-white text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1",
  };


  const sizes = iconOnly
    ? {
       
        small: "w-[32px] h-[32px] text-sm",
        medium: "w-[44px] h-[44px] text-base", 
        large: "w-[52px] h-[52px] text-lg", 
      }
    : {
        
        small: "px-4 py-2 text-sm", 
        medium: "px-4 py-2.5 text-md leading-tight",
        large: "px-6 py-3 text-base",
        xlarge: "px-20 py-3 text-base",
        addcart: "px-20 py-5 text-lg",
      };

  // Icon spacing based on button size
  const iconSpacing = {
    small: "gap-1", 
    medium: "gap-1.5", 
    large: "gap-2",
    xlarge: "gap-2.5",
    addcart: "gap-2.5",
  };

  const widthClass = fullWidth ? "w-full" : "";

  // Render icon based on position
  const renderIcon = () => {
    if (!icon || loading) return null;
    return <span className="flex-shrink-0">{icon}</span>;
  };

  // Render loading spinner
  const renderLoadingSpinner = () => {
    if (!loading) return null;
    return (
      <svg
        className="animate-spin h-4 w-4 text-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${!iconOnly ? iconSpacing[size] : ""}
        ${widthClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && renderLoadingSpinner()}
      {!loading && iconPosition === "left" && renderIcon()}
      {!iconOnly && children}
      {!loading && iconPosition === "right" && renderIcon()}
    </button>
  );
};

export default Button;