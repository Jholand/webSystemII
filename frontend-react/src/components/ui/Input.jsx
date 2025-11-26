// Reusable Input Component
const Input = ({ 
  label, 
  error, 
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-2.5 
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            border rounded-lg 
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:ring-primary-500'}
            focus:ring-2 focus:border-transparent 
            transition-all duration-200 
            bg-white text-neutral-900
            placeholder:text-neutral-400
            disabled:bg-neutral-50 disabled:text-neutral-500
            ${className}
          `}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
