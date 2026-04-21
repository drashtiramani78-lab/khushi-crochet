"use client";

import { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const Textarea = forwardRef(({ 
  label,
  error,
  rows = 4,
  className = '',
  loading = false,
  ...props 
}, ref) => {
  const baseStyles = 'w-full p-4 rounded-2xl border-2 transition-all font-medium text-lg resize-vertical focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 placeholder:text-[#6e6259]/70';
  
  const stateStyles = error 
    ? 'border-red-400 bg-red-50 ring-red-200 focus-visible:ring-red-300' 
    : 'border-[#ddd3c7] bg-[#fffbf8] hover:border-[#b59a7a] focus-visible:border-[#b59a7a] ring-[#b59a7a]/20 focus-visible:ring-[#b59a7a]/30';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold uppercase tracking-wide text-[#2f2723]">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />
        {loading && (
          <LoadingSpinner 
            size="sm" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b59a7a]" 
          />
        )}
      </div>
      {error && (
        <span className="block text-red-500 text-sm font-semibold">
          {error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

