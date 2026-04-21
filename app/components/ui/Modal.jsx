"use client";

import { useEffect, useRef } from 'react';
import Button from './Button';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
};

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  confirmText = 'Confirm', 
  onConfirm, 
  showCancel = true,
  size = 'md'
}) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        modalRef.current && modalRef.current.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-3xl shadow-2xl border border-[#ddd3c7] max-h-[90vh] overflow-y-auto ${sizes[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 id="modal-title" className="text-2xl font-bold text-[#2f2723] flex-1">
              {title}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="ml-4 -mt-1 hover:text-red-500"
              aria-label="Close modal"
            >
              ✕
            </Button>
          </div>
          
          <div className="mb-8 text-lg leading-relaxed text-[#2f2723]">
            {children}
          </div>

          {(onConfirm || showCancel) && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[#ddd3c7] justify-end">
              {showCancel && (
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="order-2 sm:order-1"
                >
                  Cancel
                </Button>
              )}
              {onConfirm && (
                <Button 
                  variant="primary" 
                  onClick={onConfirm}
                  className="order-1 sm:order-2"
                >
                  {confirmText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

