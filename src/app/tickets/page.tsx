// File: app/tickets/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { MessageSquare, Plus, Clock, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'awaiting_user';
  created_at: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  admin_reply: string | null;
  created_at: string;
  user_id: string;
}

export default function TicketsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchUserTickets(user.id);
      } else {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const fetchUserTickets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">باز</span>;
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">بسته شده</span>;
      case 'awaiting_user':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">منتظر پاسخ شما</span>;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">برای مشاهده تیکت‌ها وارد شوید</h2>
          <p className="text-gray-600 mb-6">
            برای مشاهده تیکت‌های پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.
          </p>
          <Link 
            href="/auth/login" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            ورود به حساب کاربری
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">تیکت‌های پشتیبانی</h1>
        <Link 
          href="/contact" 
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="w-5 h-5 ml-2" />
          <span>تیکت جدید</span>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      ) : tickets.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موضوع
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ ایجاد
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link 
                        href={`/tickets/${ticket.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">تیکتی یافت نشد</h2>
          <p className="text-gray-600 mb-6">
            شما هنوز تیکت پشتیبانی ارسال نکرده‌اید.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            ارسال تیکت جدید
          </Link>
        </div>
      )}
    </div>
  );
}