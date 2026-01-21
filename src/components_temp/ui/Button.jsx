// src/components/ui/Button.jsx
import React, { forwardRef } from "react";
import PropTypes from "prop-types";

const Button = forwardRef(
  (
    {
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
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    // Variant styles
    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800",
      outline:
        "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700",
      teal: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500",
      cart: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500 rounded-lg",
      overlay:
        "bg-white text-gray-900 font-medium hover:bg-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg",
      admin:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded-full",
    };

    // Size styles
    const sizes = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-4 py-2.5 text-base",
      large: "px-6 py-3 text-lg",
      xlarge: "px-8 py-4 text-lg",
      addcart: "px-20 py-5 text-lg",
    };

    // Icon-only sizes
    const iconSizes = {
      small: "w-8 h-8 p-0",
      medium: "w-10 h-10 p-0",
      large: "w-12 h-12 p-0",
      xlarge: "w-14 h-14 p-0",
    };

    // Icon spacing
    const iconSpacing = {
      small: "gap-1.5",
      medium: "gap-2",
      large: "gap-2.5",
      xlarge: "gap-3",
      addcart: "gap-3",
    };

    // Build className
    const buttonClassName = [
      baseStyles,
      variants[variant] || variants.primary,
      iconOnly ? iconSizes[size] : sizes[size],
      !iconOnly && icon ? iconSpacing[size] : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Loading spinner
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
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
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Render content
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <LoadingSpinner />
            {!iconOnly && <span className="ml-2">{children}</span>}
          </>
        );
      }

      if (iconOnly) {
        return icon || children;
      }

      return (
        <>
          {iconPosition === "left" && icon && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="truncate">{children}</span>
          {iconPosition === "right" && icon && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      );
    };

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading}
        {...props}
      >
        {renderContent()}
      </button>
    );
  },
);

// Button.propTypes = {
//   children: PropTypes.node,
//   variant: PropTypes.oneOf([
//     "primary",
//     "secondary",
//     "danger",
//     "success",
//     "outline",
//     "ghost",
//     "teal",
//     "cart",
//     "overlay",
//   ]),
//   size: PropTypes.oneOf(["small", "medium", "large", "xlarge", "addcart"]),
//   fullWidth: PropTypes.bool,
//   loading: PropTypes.bool,
//   disabled: PropTypes.bool,
//   className: PropTypes.string,
//   icon: PropTypes.node,
//   iconPosition: PropTypes.oneOf(["left", "right"]),
//   iconOnly: PropTypes.bool,
//   type: PropTypes.oneOf(["button", "submit", "reset"]),
//   onClick: PropTypes.func,
// };

Button.displayName = "Button";

export default Button;
