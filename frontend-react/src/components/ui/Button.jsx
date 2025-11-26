// Reusable Button Component with glassmorphism
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  style = {},
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border';
  
  const getVariantStyles = (variant) => {
    const styles = {
      primary: {
        className: 'text-white',
        style: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          borderColor: 'transparent',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        },
        hoverStyle: {
          background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
          transform: 'translateY(-2px)'
        }
      },
      secondary: {
        className: 'text-white',
        style: {
          background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
          borderColor: 'transparent',
          boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
        },
        hoverStyle: {
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          boxShadow: '0 6px 20px rgba(100, 116, 139, 0.4)',
          transform: 'translateY(-2px)'
        }
      },
      outline: {
        className: 'text-primary-600 border-primary-300 hover:text-white',
        style: {
          background: 'white',
          borderColor: '#93C5FD',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        },
        hoverStyle: {
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          borderColor: 'transparent',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }
      },
      ghost: {
        className: 'text-gray-700',
        style: {
          background: 'transparent',
          borderColor: 'transparent',
          boxShadow: 'none'
        },
        hoverStyle: {
          background: '#F1F5F9',
          borderColor: 'transparent'
        }
      },
      danger: {
        className: 'text-white',
        style: {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          borderColor: 'transparent',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
        },
        hoverStyle: {
          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)',
          transform: 'translateY(-2px)'
        }
      }
    };
    return styles[variant] || styles.primary;
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };
  
  const variantStyles = getVariantStyles(variant);

  return (
    <button
      className={`${baseClasses} ${variantStyles.className} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ ...variantStyles.style, ...style }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, variantStyles.hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, variantStyles.style);
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

export default Button;
