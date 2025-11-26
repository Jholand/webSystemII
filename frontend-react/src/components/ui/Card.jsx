// Reusable Card Component with Glassmorphism
const Card = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '',
  style = {},
  bordered = false,
  hoverable = false,
  padding = 'default'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={`
        rounded-2xl transition-all duration-300
        bg-white dark:bg-gray-800
        ${bordered ? 'border border-yellow-200/20 dark:border-yellow-500/20' : 'border border-gray-200 dark:border-gray-700'}
        shadow-sm
        ${hoverable ? 'hover:border-green-500/30 dark:hover:border-green-400/30 hover:shadow-lg hover:-translate-y-0.5' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
      style={style}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
