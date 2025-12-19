// src/components/ui/Card.jsx
import React from "react";

const Card = ({
  children,
  className = "",
  padding = true,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        rounded-xl shadow-sm
        border border-gray-200 dark:border-gray-700
        ${hover ? "hover:shadow-md transition-shadow duration-200" : ""}
        ${padding ? "p-6" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = "" }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

Card.Title = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}
  >
    {children}
  </h3>
);

Card.Description = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
    {children}
  </p>
);

Card.Body = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

Card.Footer = ({ children, className = "" }) => (
  <div
    className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export default Card;
