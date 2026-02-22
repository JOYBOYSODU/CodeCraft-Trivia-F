import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  const getErrorIcon = (status) => {
    switch (status) {
      case 401:
      case 403:
        return '🔐';
      case 409:
        return '⚠️';
      case 404:
        return '❌';
      case 400:
        return '📝';
      case 500:
        return '🔥';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = (status, message) => {
    if (message) return message;
    switch (status) {
      case 400:
        return 'Invalid Input';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 500:
        return 'Server Error';
      default:
        return 'Error';
    }
  };

  const getErrorDescription = (status, message) => {
    if (message && message !== getErrorTitle(status, message)) {
      return message;
    }
    
    switch (status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'Invalid credentials. Please check your password and try again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This email is already registered. Please use a different email or log in.';
      case 500:
        return 'The server encountered an error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              {getErrorTitle(error.status, error.title)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-red-100 rounded-lg transition text-red-600 hover:text-red-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {getErrorDescription(error.status, error.message)}
          </p>

          {/* Status Code Badge */}
          {error.status && (
            <div className="mt-4 inline-block">
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                Error {error.status}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 flex gap-3 justify-end border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
