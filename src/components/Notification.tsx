// File: components/Notification.tsx

'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Notification({ message, isVisible, onClose }: NotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // نوتیفیکیشن بعد از ۳ ثانیه به طور خودکار بسته می‌شود
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
      <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]">
        <span>{message}</span>
        <button onClick={onClose} className="mr-4">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}