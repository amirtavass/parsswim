function Button({ children, active = false, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={` px-6 py-4 rounded-md font-medium  transition-all duration-200 ${
        active
          ? "bg-primary text-white shadow-md "
          : "bg-white text-gray-700 hover:bg-gray-50 hover:text-primary border border-gray-200 hover:border-primary hover:shadow-sm"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
