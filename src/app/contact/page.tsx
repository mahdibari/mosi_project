// File: app/contact/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
   
  Phone, 
  MapPin, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  HeadphonesIcon,
 
  ArrowLeft,
  Loader2
} from 'lucide-react';

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

export default function ContactPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          fetchUserTickets(user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const fetchUserTickets = async (userId: string) => {
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('خطا در بارگذاری تیکت‌ها');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;
      
      setTicketMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      setError('خطا در بارگذاری پیام‌ها');
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchTicketMessages(ticket.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert([
          { 
            user_id: user.id, 
            subject,
            status: 'open'
          }
        ])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create initial message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert([
          { 
            ticket_id: ticketData.id,
            user_id: user.id,
            content: message
          }
        ]);

      if (messageError) throw messageError;

      // Reset form and refresh tickets
      setSubject('');
      setMessage('');
      setSuccess(true);
      fetchUserTickets(user.id);
      
      // Reset success message after 3 seconds
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

  return (
    <div className="min-h-screen bg-gradient-to-br  text-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          تماس با ما
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:scale-105">
              <div className="flex items-center mb-6">
                <HeadphonesIcon className="w-8 h-8 text-indigo-600 ml-3" />
                <h2 className="text-2xl font-bold text-gray-800">اطلاعات تماس</h2>
              </div>
              
              <div className="space-y-6">
                {[
                  { icon: Phone, label: 'تلفن', value: '09051415639' },
                  
                  { icon: MapPin, label: 'آدرس', value: '  تهران خیابان جمهوری بین سه راه جمهوری و شیخ هادی نبش بن بست شهریار پاساژ علاالدین آرایشی طبقه دوم واحد ۲۰۸ ' },
                  { icon: Clock, label: 'ساعات کاری', value: 'شنبه تا چهارشنبه: ۹ الی ۱۷' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-700">{item.label}</h3>
                      <p className="text-gray-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* User Tickets */}
            {user && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">تیکت‌های شما</h2>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket)}
                        className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(ticket.created_at).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">شما هنوز تیکتی ارسال نکرده‌اید.</p>
                )}
              </div>
            )}
          </div>
          
          {/* Contact Form / Ticket Messages - Left Side */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              // Ticket Messages View
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 ml-1" />
                    بازگشت به لیست تیکت‌ها
                  </button>
                </div>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {ticketMessages.map((msg, ) => (
                    <div key={msg.id} className="space-y-2">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="bg-indigo-500 text-white p-3 rounded-2xl rounded-br-none max-w-xs lg:max-w-md">
                          <p>{msg.content}</p>
                          <span className="text-xs text-indigo-100 mt-1 block">
                            {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {/* Admin Reply - only if it exists */}
                      {msg.admin_reply && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-bl-none max-w-xs lg:max-w-md">
                            <p>{msg.admin_reply}</p>
                            <span className="text-xs text-gray-500 mt-1 block">
                              {new Date(msg.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {selectedTicket.status === 'awaiting_user' && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800">این تیکت منتظر پاسخ شماست.</p>
                  </div>
                )}
              </div>
            ) : user ? (
              // Ticket Form for Logged In Users
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-8 h-8 text-indigo-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">ارسال تیکت جدید</h2>
                </div>
                
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                    <p className="text-green-800">تیکت شما با موفقیت ارسال شد.</p>
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">موضوع تیکت</label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">متن پیام</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 ml-2" />
                        ارسال تیکت
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Login Prompt for Non-Logged In Users
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <MessageSquare className="w-24 h-24 text-indigo-300 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">برای ارسال تیکت وارد شوید</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  برای ارسال تیکت پشتیبانی، لطفاً ابتدا وارد حساب کاربری خود شوید.
                </p>
                <Link 
                  href="/auth/login" 
                  className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg"
                >
                  ورود به حساب کاربری
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}