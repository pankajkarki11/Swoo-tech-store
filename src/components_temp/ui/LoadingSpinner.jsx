const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  className = "",
}) => {
  const sizes = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
    xlarge: "h-16 w-16",
  };

  const colors = {
    primary: "text-blue-600",
    white: "text-white",
    gray: "text-gray-600",
    teal: "text-teal-600",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizes[size]} ${colors[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"//fills the inside of the shape butween rotating lines
        // stroke='blue'
        viewBox="0 0 24 24"      //definse the coordinate system for svg
//               │ │ │  └── height (24 units)
//               │ │ └───── width (24 units)
//               │ └──────── min-y (starts at 0)
//               └─────────── min-x (starts at 0)
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
          d="M4 12 a8 8 0 018-8 V0 C5.373 0 0 5.373   0 12 h4 z  
           m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"//tells what shape to draw
          //M=move to
          //A=arc
          //L=Line
          //Z=close
          //H=horizontal
          //V=vertical
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;
