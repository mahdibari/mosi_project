// File: app/tickets/[id]/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react'; // useCallback اضافه شد
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Reply, ArrowRight, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'awaiting_user';
  created_at: string;
}

interface TicketMessage {
  id: string;
  content: string;
  admin_reply: string | null;
  created_at: string;
  user_id: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // --- تابع با useCallback پوشانده شد ---
  const fetchTicketDetails = useCallback(async (id: string, userId: string) => {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (ticketError) throw ticketError;
      
      setTicket(ticketData);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      
      setTicketMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      router.push('/tickets');
    } finally {
      setLoading(false);
    }
  }, [router]); // وابستگی مشخص شد

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchTicketDetails(ticketId, user.id);
      } else {
        setLoading(false);
      }
    };

    getUser();
  }, [ticketId, fetchTicketDetails]); // وابستگی اضافه شد

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ticket || !message.trim()) return;
    
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert([
          { 
            ticket_id: ticket.id,
            user_id: user.id,
            content: message
          }
        ]);

      if (messageError) throw messageError;

      const { error: statusError } = await supabase
        .from('tickets')
        .update({ status: 'open' })
        .eq('id', ticket.id);

      if (statusError) throw statusError;

      setMessage('');
      setSuccess(true);
      fetchTicketDetails(ticket.id, user.id);
      
      setTimeout(() => setSuccess(false), 3000);
    
    } finally {
      setSubmitting(false);
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
          <h2 className="text-2xl font-semibold mb-4">برای مشاهده تیکت وارد شوید</h2>
          <p className="text-gray-600 mb-6">
            برای مشاهده تیکت پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">تیکت یافت نشد</h2>
          <p className="text-gray-600 mb-6">
            تیکت مورد نظر یافت نشد یا شما دسترسی مشاهده آن را ندارید.
          </p>
          <Link 
            href="/tickets" 
            className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            بازگشت به تیکت‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link href="/tickets" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowRight className="w-5 h-5 ml-1 rotate-180" />
          بازگشت به تیکت‌ها
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          {getStatusBadge(ticket.status)}
        </div>
        
        <div className="space-y-4 mb-6">
          {ticketMessages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {msg.content && (
                <div className="p-4 rounded-lg bg-indigo-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">شما</span>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              )}
              
              {msg.admin_reply && (
                <div className="p-4 rounded-lg bg-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">پشتیبانی</span>
                    <span className="text-sm text-gray-500">
                      {new Date(msg.created_at).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p>{msg.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {ticket.status === 'awaiting_user' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">
              این تیکت منتظر پاسخ شماست. لطفاً به پیام پشتیبانی پاسخ دهید.
            </p>
          </div>
        )}
        
        {ticket.status !== 'closed' && (
          <form onSubmit={handleSubmit} className="mt-6">
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <p className="text-green-800">پیام شما با موفقیت ارسال شد.</p>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 mb-2">پیام شما</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
            >
              {submitting ? (
                <span>در حال ارسال...</span>
              ) : (
                <>
                  <Reply className="w-5 h-5 ml-2" />
                  <span>ارسال پیام</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}