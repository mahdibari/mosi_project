// File: components/UserMenu.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { User as UserIcon, LogOut, Settings, Ticket } from 'lucide-react';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  if (!user) {
    return (
      <div className="flex space-x-4">
        <Link href="/auth/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
          ورود
        </Link>
        <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          ثبت‌نام
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
      >
        <UserIcon className="w-5 h-5" />
        <span className="ml-2">{user.email?.split('@')[0]}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 ml-2" />
              پروفایل
            </div>
          </Link>
          <Link
            href="/tickets"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Ticket className="w-4 h-4 ml-2" />
              تیکت‌های پشتیبانی
            </div>
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center">
              <Settings className="w-4 h-4 ml-2" />
              تنظیمات
            </div>
          </Link>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={handleLogout}
            className="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="flex items-center">
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </div>
          </button>
        </div>
      )}
    </div>
  );
}