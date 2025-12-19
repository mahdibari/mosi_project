// File: components/Toast.tsx

'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Automatically close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle : XCircle;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg animate-fade-in">
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${bgColor} rounded-lg`}>
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div className="mr-3 text-sm font-medium text-gray-900">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}