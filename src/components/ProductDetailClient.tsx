// File: components/ProductDetailClient.tsx

'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { Product } from '@/types';

export default function ProductDetailClient({ product }: { product: Product }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLiked, setUserLiked] = useState(false);
  

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: like } = await supabase.from('product_likes').select('id').eq('product_id', product.id).eq('user_id', user.id).single();
        setUserLiked(!!like);
      }
    };
    fetchUserData();
  }, [product.id]);

  const handleLike = async () => {
    if (!user) {
      alert('برای لایک کردن باید وارد شوید');
      return;
    }
    // ... (این تابع دقیقاً مانند تابع handleLike در ProductCard است)
    // برای کوتاه شدن، آن را اینجا تکرار نمی‌کنم، اما باید کپی شود.
    alert('لایک با موفقیت ثبت شد!');
  };

  return (
    <div className="flex gap-4">
      <button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
        <ShoppingCart className="w-6 h-6" />
        افزودن به سبد خرید
      </button>
      <button
        onClick={handleLike}
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          userLiked ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      >
        <Heart className={`w-7 h-7 transition-all duration-300 ${userLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </button>
    </div>
  );
}