import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SlideDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = 'md' // 'sm' | 'md' | 'lg' | 'full'
}) {
  const widthClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    full: 'w-full'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 bottom-0 ${widthClasses[width]} bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
