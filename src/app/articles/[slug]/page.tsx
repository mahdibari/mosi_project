// File: app/articles/[slug]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, Calendar, FileText, Heart } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/Toast'; // فرض می‌کنیم این کامپوننت را دارید

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  total_likes: number;
  created_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [user, setUser] = useState<User | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [liking, setLiking] = useState(false);
  
  // Toast states
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', isVisible: false });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  // تابع برای چک اینکه آیا کاربر مقاله را لایک کرده
  const checkIfLiked = useCallback(async (articleId: string, userId: string) => {
    const { data, } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single();

    if (data) {
      setIsLiked(true);
    }
  }, []);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!slug) return;

      // دریافت اطلاعات مقاله
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (articleError) {
        console.error('Error fetching article:', articleError);
        router.push('/');
        return;
      }

      setArticle(articleData);
      setTotalLikes(articleData.total_likes || 0);

      // اگر کاربر وارد کرده بود، چک کن که آیا لایک کرده یا نه
      if (user && articleData) {
        await checkIfLiked(articleData.id, user.id);
      }

      setLoading(false);
    };

    getInitialData();
  }, [slug, router, checkIfLiked]);

  const handleLike = async () => {
    if (!user) {
      showToast('برای لایک کردن مقاله، باید وارد حساب کاربری خود شوید.', 'error');
      router.push('/auth/login');
      return;
    }

    if (!article || liking) return;

    setLiking(true);
    const originalIsLiked = isLiked;
    const originalTotalLikes = totalLikes;

    // به‌روزرسانی فوری UI (Optimistic UI)
    setIsLiked(!originalIsLiked);
    setTotalLikes(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      if (originalIsLiked) {
        // آنلایک کردن: حذف رکورد از جدول
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);

        if (error) throw error;

        // به‌روزرسانی تعداد لایک‌ها در جدول مقالات
        const { error: updateError } = await supabase.rpc('decrement_article_likes', { 
          article_id: article.id 
        });
        if (updateError) throw updateError;
        
      } else {
        // لایک کردن: درج رکورد در جدول
        const { error } = await supabase
          .from('article_likes')
          .insert({ article_id: article.id, user_id: user.id });

        if (error) throw error;

        // به‌روزرسانی تعداد لایک‌ها در جدول مقالات
        const { error: updateError } = await supabase.rpc('increment_article_likes', { 
          article_id: article.id 
        });
        if (updateError) throw updateError;
      }
    } catch  {
      // بازگرداندن وضعیت در صورت بروز خطا
      setIsLiked(originalIsLiked);
      setTotalLikes(originalTotalLikes);
     
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">مقاله یافت نشد</h1>
        <p className="text-gray-600 mb-6">متاسفانه مقاله‌ای که به دنبال آن بودید، وجود ندارد.</p>
        <Link href="/" className="text-indigo-600 hover:underline font-semibold">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200">
              <ArrowLeft className="w-5 h-5 ml-1 rotate-180" />
              بازگشت به صفحه اصلی
            </Link>
          </div>

          <article className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 lg:p-12 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">{article.title}</h1>
                  <div className="flex items-center text-indigo-100">
                    <Calendar className="w-5 h-5 ml-2" />
                    <span>
                      {new Date(article.created_at).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* دکمه لایک */}
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                    isLiked
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  } ${liking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={user ? (isLiked ? 'آنلایک کردن' : 'لایک کردن') : 'برای لایک وارد شوید'}
                >
                  <Heart
                    className={`w-7 h-7 transition-transform duration-200 ${liking ? 'animate-pulse' : ''} ${
                      isLiked ? 'fill-current' : ''
                    }`}
                  />
                  <span className="text-sm font-bold mt-1">{totalLikes}</span>
                </button>
              </div>
            </header>
            
            <div className="p-8 lg:p-12">
              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}