// src/components/ui/Table.jsx
import React from "react";

const Table = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

Table.Header = ({ children, className = "" }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr className={className}>{children}</tr>
  </thead>
);

Table.HeaderCell = ({ children, className = "", ...props }) => (
  <th
    className={`
      px-6 py-3 text-left text-xs font-medium 
      text-gray-500 dark:text-gray-400 
      uppercase tracking-wider
      ${className}
    `}
    {...props}
  >
    {children}
  </th>
);

Table.Body = ({ children, className = "", ...props }) => (
  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

Table.Row = ({ children, className = "", hover = true, ...props }) => (
  <tr
    className={`
      ${hover ? "hover:bg-gray-50 dark:hover:bg-gray-700" : ""}
      transition-colors duration-150
      ${className}
    `}
    {...props}
  >
    {children}
  </tr>
);

Table.Cell = ({ children, className = "", ...props }) => (
  <td
    className={`
      px-6 py-4 whitespace-nowrap text-sm 
      text-gray-900 dark:text-gray-300
      ${className}
    `}
    {...props}
  >
    {children}
  </td>
);

export default Table;
