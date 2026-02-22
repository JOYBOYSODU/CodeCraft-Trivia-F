import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      bg: 'bg-red-500/10',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      icon: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
    },
    info: {
      icon: 'text-blue-500',
      bg: 'bg-blue-500/10',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md mx-4 border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className={`flex items-start gap-4 p-4 rounded-lg ${style.bg}`}>
            <AlertTriangle size={24} className={`shrink-0 ${style.icon}`} />
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-semibold transition ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
