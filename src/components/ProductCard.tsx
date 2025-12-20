// File: components/ProductCard.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { Product } from '@/types';
import ProductStructuredData from './ProductStructuredData';
import { ShoppingCart, Heart, Eye, Tag, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import Toast from './Toast'; // تغییر این خط


export default function ProductCard({ product }: { product: Product }) {
  const [likes, setLikes] = useState(product.total_likes);
  const [userLiked, setUserLiked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false); // اضافه کردن state برای نمایش toast
  const [toastMessage, setToastMessage] = useState(''); // اضافه کردن state برای پیام toast
  const [toastType, setToastType] = useState<'success' | 'error'>('success'); // اضافه کردن state برای نوع toast
  const { addToCart } = useCart();

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

  const finalPrice = product.discount_percentage ? product.price * (1 - product.discount_percentage / 100) : product.price;

  const handleLike = async () => {
    if (!user) {
      alert('برای لایک کردن باید وارد شوید');
      return;
    }
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 300);

    const originalUserLiked = userLiked;
    const originalLikes = likes;

    setUserLiked(!originalUserLiked);
    setLikes(originalUserLiked ? likes - 1 : likes + 1);

    try {
      if (originalUserLiked) {
        const { error: likeError } = await supabase.from('product_likes').delete().eq('product_id', product.id).eq('user_id', user.id);
        if (likeError) throw likeError;
        const { error: productError } = await supabase.rpc('decrement_likes', { product_id: product.id });
        if (productError) throw productError;
      } else {
        const { error: likeError } = await supabase.from('product_likes').insert({ product_id: product.id, user_id: user.id });
        if (likeError) throw likeError;
        const { error: productError } = await supabase.rpc('increment_likes', { product_id: product.id });
        if (productError) throw productError;
      }
    } catch (error) {
      console.error('Error updating like:', error);
      setUserLiked(originalUserLiked);
      setLikes(originalLikes);
      alert('خطایی در ثبت لایک رخ داد. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product);
      // نمایش toast سفارشی
      setToastMessage(`${product.name} به سبد خرید اضافه شد`);
      setToastType('success');
      setShowToast(true);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <>
      <ProductStructuredData product={product} />
      <div className="group relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:shadow-2xl">
        <div className="relative h-80 w-full">
          {product.image_url ? (
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200"><span className="text-gray-500">عکس موجود نیست</span></div>
          )}
          {product.is_bestseller && <span className="absolute left-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow-lg">🏆 پرفروش</span>}
          {product.discount_percentage && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">%{product.discount_percentage} تخفیف</span>}
        </div>
        
        {/* بخش اطلاعات محصول - همیشه نمایش داده می‌شود */}
        <div className="p-6 bg-white">
          <Link href={`/product/${product.id}`}><h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3></Link>
          
          {/* نمایش برند محصول */}
          {product.brand_tag && (
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{product.brand_tag}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => (<span key={i} className={i < Math.round(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>))}</div>
            <span className="text-xs text-gray-500">({product.total_reviews} نظر)</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              {product.discount_percentage && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
              <span className="mr-2 text-lg font-bold text-green-600">{formatPrice(finalPrice)}</span>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${product.stock_quantity > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{product.stock_quantity > 0 ? 'موجود' : 'ناموجود'}</span>
          </div>
          
          {/* دکمه‌ها - همیشه نمایش داده می‌شوند */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_quantity <= 0}
              className="group flex-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                {isAddingToCart ? 'در حال افزودن...' : 'افزودن به سبد'}
              </span>
            </button>
            
            <Link
              href={`/products/${product.id}`}
              className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition-all duration-300 hover:border-indigo-500 hover:text-indigo-600 hover:scale-110 active:scale-95"
            >
              <Eye className="w-5 h-5" />
            </Link>
            
            <button
              onClick={handleLike}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                userLiked ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
              } transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                isLiking ? 'scale-125' : ''
              }`}
            >
              <Heart
                className={`w-6 h-6 transition-all duration-300 ${
                  userLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                } ${isLiking ? 'animate-ping' : ''}`}
              />
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-500 mt-3">{likes} نفر این محصول را دوست داشتند</p>
        </div>
      </div>
      
      {/* اضافه کردن کامپوننت Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}