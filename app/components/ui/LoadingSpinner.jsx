"use client";

/** @typedef {{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}} LoadingSpinnerProps */

/**
 * @param {LoadingSpinnerProps} param0
 */
const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-3',
  lg: 'w-8 h-8 border-4'
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'border-[#b59a7a] border-t-transparent', 
  className = '' 
}) {
  return (
    <div 
      className={`animate-spin rounded-full ${sizeClasses[size]} ${color} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

