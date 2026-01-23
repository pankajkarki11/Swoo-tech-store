const Table = ({
   children,
    className = "",
     ...props }) => {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}//overflwo-x-auto adds the horizontal scroll bar if the table is wider than container
    >
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"//min-w-full makes the table take 100% of the parents width//divide y adds a line between each row between thead and tbody which seperates the title of table and body which is data
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
    `}//px and py are horizontal and vertical padding which add space between the text and the border in both direction equally//tracking-wider adds more space between letters,more breating room 
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
    `}//whitespace-nowrap prevents the text from wrapping to the next line like john doe is large name if we dont use this we can see john in one line and doe in the next which is not good looking so we use whitespace-nowrap which makes john doe appers in same line
    {...props}
  >
    {children}
  </td>
);

export default Table;
