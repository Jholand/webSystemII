// Reusable Badge Component
const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-gradient-to-r from-blue-100 to-blue-200 text-primary-700 border border-blue-200',
    success: 'bg-gradient-to-r from-blue-50 to-blue-100 text-primary-700 border border-blue-200',
    warning: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 
      font-medium rounded-full
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-yellow-500' :
          variant === 'error' ? 'bg-red-500' :
          variant === 'info' ? 'bg-blue-500' :
          variant === 'primary' ? 'bg-primary-500' :
          'bg-neutral-500'
        }`} />
      )}
      {icon && icon}
      {children}
    </span>
  );
};

export default Badge;
