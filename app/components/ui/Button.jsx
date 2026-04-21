"use client";

import { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = forwardRef(({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false,
  className = '',
  children, 
  disabled,
  loadingText = 'Loading...',
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wide transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-2xl shadow-lg hover:shadow-xl';
  
  const variants = {
    primary: 'bg-[#2f2723] text-white hover:bg-opacity-90 ring-[#b59a7a]/50',
    secondary: 'bg-[#b59a7a] text-white hover:bg-opacity-90 ring-[#2f2723]/50',
    ghost: 'bg-transparent text-[#2f2723] border-2 border-[#2f2723] hover:bg-[#2f2723] hover:text-white',
    danger: 'bg-red-500 text-white hover:bg-red-600 ring-red-400/50',
    outline: 'bg-white text-[#2f2723] border-2 border-[#2f2723] hover:bg-[#2f2723] hover:text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${loading ? 'gap-2' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />}
      {loading ? loadingText : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;


