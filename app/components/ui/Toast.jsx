"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

const Toast = ({ 
  id, 
  title, 
  message, 
  type = 'info',
  duration = 5000,
  onClose,
  showClose = true 
}) => {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(0);

  const colors = {
    success: 'bg-green-500 border-green-400 text-white ring-green-400/50',
    error: 'bg-red-500 border-red-400 text-white ring-red-400/50',
    warning: 'bg-yellow-500 border-yellow-400 text-white ring-yellow-400/50',
    info: 'bg-[#b59a7a] border-[#b59a7a] text-white ring-[#b59a7a]/50'
  };

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    timerRef.current = window.setTimeout(dismiss, duration);
    
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [dismiss, duration]);

  return (
    <div className={`toast animate-in slide-in-from-top-2 fade-in duration-300 border shadow-xl ${colors[type]}`}>
      <div className="flex items-start gap-4 p-6">
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${colors[type].replace('bg-', 'bg-opacity-90 shadow-')}`}>
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1 truncate">{title}</h3>
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        {showClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={dismiss}
            className="ml-auto flex-shrink-0 -mt-1"
          >
            ✕
          </Button>
        )}
      </div>
      <div className="h-1 bg-white/30 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-white/50 transition-all duration-${duration/1000} ease-linear`}
          style={{animationDuration: `${duration}ms`, animation: `progress ${duration}ms linear forwards`}}
        />
      </div>
    </div>
  );
};

export default Toast;

