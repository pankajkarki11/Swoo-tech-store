// src/components/ui/Button.jsx
import React, { forwardRef, useMemo } from "react";
import PropTypes from "prop-types";

// Utility function for merging classes
const mergeClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

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
      ariaLabel,
      dataTestId,

      // Advanced props for bypassing defaults
      baseClassName = "", // Completely replace base styles
      variantClassName = "", // Replace variant styles
      sizeClassName = "", // Replace size styles
      iconSpacingClassName = "", // Replace icon spacing
      // Component composition props
      as: Component = "button",
      href,
      target,
      rel,
      // CSS-in-JS style injection
      style,
      // Custom render props
      renderIcon,
      renderLoading,
      renderChildren,
      // State overrides
      overrideStyles = {},
      // Theme customization
      theme = {},
      // Event handlers with custom logic
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      // Custom attributes
      customAttributes = {},
      // Slot props for advanced composition
      iconSlot,
      contentSlot,
      loadingSlot,
      // Compound component props
      __disableDefaults = false,
      ...props
    },
    ref
  ) => {
    // Determine if we should use any default styles
    const useDefaults = !__disableDefaults;

    // Default base styles (can be completely bypassed)
    const defaultBaseStyles = useDefaults
      ? "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:bg-gradient-to-br disabled:from-gray-500 disabled:to-gray-700 disabled:cursor-not-allowed active:scale-[0.98]"
      : "";

    // Default variants (can be partially or completely overridden)
    const defaultVariants = useDefaults
      ? {
          primary:
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
          secondary:
            "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:focus:ring-gray-400",
          danger:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
          success:
            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800",
          outline:
            "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-400",
          ghost:
            "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-700 ",
          teal: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500",
          cart: "bg-gradient-to-r from-[#01A49E] to-[#01857F] text-white font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:ring-teal-500 rounded-lg",
          overlay:
            "bg-white text-gray-900 font-medium hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg",
          // Theme-aware variants
          custom: "", // Empty for custom styling
        }
      : {};

    // Default sizes (can be overridden)
    const defaultSizes = useDefaults
      ? {
          small: "px-3 py-1.5 text-sm min-h-[32px]",
          medium: "px-4 py-2.5 text-base min-h-[44px]",
          large: "px-6 py-3 text-base min-h-[52px]",
          xlarge: "px-8 py-4 text-lg min-h-[60px]",
          addcart: "px-20 py-5 text-lg min-h-[64px]",
          "icon-small": "w-8 h-8 p-0",
          "icon-medium": "w-10 h-10 p-0",
          "icon-large": "w-12 h-12 p-0",
        }
      : {};

    // Default icon spacing (can be overridden)
    const defaultIconSpacing = useDefaults
      ? {
          small: "gap-1.5",
          medium: "gap-2",
          large: "gap-2.5",
          xlarge: "gap-3",
          addcart: "gap-3",
          "icon-small": "gap-0",
          "icon-medium": "gap-0",
          "icon-large": "gap-0",
        }
      : {};

    // Merge theme overrides with defaults
    const mergedVariants = useMemo(() => {
      if (!useDefaults) return {};
      return {
        ...defaultVariants,
        ...theme.variants,
      };
    }, [useDefaults, theme.variants]);

    const mergedSizes = useMemo(() => {
      if (!useDefaults) return {};
      return {
        ...defaultSizes,
        ...theme.sizes,
      };
    }, [useDefaults, theme.sizes]);

    // Determine size class
    const sizeKey = iconOnly ? `icon-${size}` : size;
    const sizeClass = sizeClassName || 
                     (useDefaults && mergedSizes[sizeKey]) || 
                     (useDefaults && mergedSizes.medium) || 
                     "";

    // Determine spacing class
    const spacingClass = iconSpacingClassName ||
                        (useDefaults && defaultIconSpacing[sizeKey]) ||
                        "";

    // Determine variant class
    const variantClass = variantClassName ||
                        (useDefaults && mergedVariants[variant]) ||
                        "";

    // Determine width class
    const widthClass = fullWidth && useDefaults ? "w-full" : "";

    // Determine if button should be square for icon-only
    const iconOnlyClass = iconOnly && useDefaults ? "aspect-square" : "";

    // Build className with priority: custom > override > defaults
    const buttonClassName = mergeClasses(
      baseClassName || defaultBaseStyles,
      variantClass,
      sizeClass,
      !iconOnly ? spacingClass : "",
      widthClass,
      iconOnlyClass,
      className
    );

    // Custom icon renderer
    const renderCustomIcon = () => {
      if (loading && renderLoading) {
        return renderLoading();
      }
      
      if (renderIcon) {
        return renderIcon({ icon, iconPosition, loading, iconOnly });
      }
      
      if (iconSlot) {
        return iconSlot;
      }
      
      if (!icon || loading) return null;
      
      return (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      );
    };

    // Custom loading renderer
    const renderCustomLoading = () => {
      if (loadingSlot) return loadingSlot;
      
      if (renderLoading) {
        return renderLoading();
      }
      
      return <DefaultLoadingSpinner />;
    };

    // Custom children renderer
    const renderCustomChildren = () => {
      if (contentSlot) return contentSlot;
      
      if (renderChildren) {
        return renderChildren({ children, loading, iconOnly });
      }
      
      return children;
    };

    // Determine button content based on loading and composition
    const renderContent = () => {
      if (loading) {
        return (
          <>
            {renderCustomLoading()}
            {!iconOnly && <span className="ml-2">{renderCustomChildren()}</span>}
          </>
        );
      }

      if (iconOnly) {
        return renderCustomIcon() || renderCustomChildren();
      }

      return (
        <>
          {iconPosition === "left" && renderCustomIcon()}
          <span className="truncate">{renderCustomChildren()}</span>
          {iconPosition === "right" && renderCustomIcon()}
        </>
      );
    };

    // Handle accessibility
    const buttonAriaLabel = ariaLabel || 
                           (iconOnly && typeof children === 'string' ? children : undefined);

    // Merge custom styles with overrides
    const mergedStyle = {
      ...overrideStyles,
      ...style,
    };

    // Merge all custom attributes
    const mergedAttributes = {
      ...customAttributes,
      ...(Component === 'a' && href ? { href, target, rel } : {}),
      'data-testid': dataTestId,
      'aria-label': buttonAriaLabel,
      'aria-busy': loading,
    };

    // Common button props
    const buttonProps = {
      ref,
      className: buttonClassName,
      disabled: disabled || loading,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      style: mergedStyle,
      ...mergedAttributes,
      ...props,
    };

    // If using custom Component, add type prop only for button elements
    if (Component === 'button' || Component === 'input') {
      buttonProps.type = type;
    }

    return (
      <Component {...buttonProps}>
        {renderContent()}
      </Component>
    );
  }
);

// Default loading spinner
const DefaultLoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
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

// PropTypes
Button.propTypes = {
  // Basic props
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "outline",
    "ghost",
    "teal",
    "cart",
    "overlay",
    "custom",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large", "xlarge", "addcart"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  iconOnly: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  
  // Advanced props
  baseClassName: PropTypes.string,
  variantClassName: PropTypes.string,
  sizeClassName: PropTypes.string,
  iconSpacingClassName: PropTypes.string,
  
  // Component composition
  as: PropTypes.elementType,
  href: PropTypes.string,
  target: PropTypes.string,
  rel: PropTypes.string,
  
  // Style injection
  style: PropTypes.object,
  
  // Render props
  renderIcon: PropTypes.func,
  renderLoading: PropTypes.func,
  renderChildren: PropTypes.func,
  
  // State overrides
  overrideStyles: PropTypes.object,
  
  // Theme customization
  theme: PropTypes.shape({
    variants: PropTypes.object,
    sizes: PropTypes.object,
  }),
  
  // Event handlers
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  
  // Custom attributes
  customAttributes: PropTypes.object,
  
  // Slot props
  iconSlot: PropTypes.node,
  contentSlot: PropTypes.node,
  loadingSlot: PropTypes.node,
  
  // Accessibility
  ariaLabel: PropTypes.string,
  dataTestId: PropTypes.string,
  
  // Danger zone
  __dangerouslyDisableDefaults: PropTypes.bool,
};

Button.displayName = "Button";

// Compound component exports
Button.Icon = ({ children, className = "" }) => (
  <span className={`flex-shrink-0 ${className}`}>
    {children}
  </span>
);

Button.Text = ({ children, className = "" }) => (
  <span className={`truncate ${className}`}>
    {children}
  </span>
);

Button.Loading = ({ className = "", size = "medium" }) => {
  const sizeMap = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6",
  };
  
  return (
    <svg
      className={`animate-spin ${sizeMap[size]} ${className}`}
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
};

export default Button;