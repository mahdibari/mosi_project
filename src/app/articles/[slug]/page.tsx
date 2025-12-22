'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image'; // اضافه شدن
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, Calendar, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url?: string | null; // اضافه شدن
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
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', isVisible: false });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const checkIfLiked = useCallback(async (articleId: string, userId: string) => {
    const { data } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', userId)
      .single();
    if (data) setIsLiked(true);
  }, []);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!slug) return;

      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (articleError) {
        router.push('/');
        return;
      }

      setArticle(articleData);
      setTotalLikes(articleData.total_likes || 0);
      if (user && articleData) await checkIfLiked(articleData.id, user.id);
      setLoading(false);
    };
    getInitialData();
  }, [slug, router, checkIfLiked]);

  const handleLike = async () => {
    if (!user) {
      showToast('لطفاً وارد شوید', 'error');
      router.push('/auth/login');
      return;
    }
    if (!article || liking) return;

    setLiking(true);
    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setTotalLikes(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      if (originalIsLiked) {
        await supabase.from('article_likes').delete().eq('article_id', article.id).eq('user_id', user.id);
        await supabase.rpc('decrement_article_likes', { article_id: article.id });
      } else {
        await supabase.from('article_likes').insert({ article_id: article.id, user_id: user.id });
        await supabase.rpc('increment_article_likes', { article_id: article.id });
      }
    } catch {
      setIsLiked(originalIsLiked);
      setTotalLikes(prev => originalIsLiked ? prev + 1 : prev - 1);
    } finally {
      setLiking(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    </div>
  );

  if (!article) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <Toast {...toast} onClose={() => setToast({ ...toast, isVisible: false })} />
      
      {/* هدر مقاله با تصویر داینامیک */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-gray-900">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 opacity-40" />
        )}
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-20">
          <div className="container mx-auto max-w-4xl">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              بازگشت به خانه
            </Link>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                {new Date(article.created_at).toLocaleDateString('fa-IR')}
              </div>
              <div className="h-4 w-[1px] bg-white/20"></div>
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isLiked ? 'text-pink-500 fill-pink-500' : ''}`} />
                {totalLikes} پسند
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-16 border border-gray-100">
          {/* دکمه‌های اکشن سریع */}
          <div className="flex justify-between items-center mb-12 pb-8 border-b border-gray-100">
            <div className="flex gap-4">
               <button onClick={handleLike} disabled={liking} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-bold ${isLiked ? 'bg-pink-50 text-pink-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                 <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                 {isLiked ? 'پسندیدم' : 'پسندیدن'}
               </button>
               <button className="p-2.5 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>

          <div
            className="prose prose-indigo prose-lg max-w-none text-gray-700 leading-relaxed prose-img:rounded-3xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </div>
  );
}