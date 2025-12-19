// File: components/ProductCard.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { Product } from '@/types';
import ProductStructuredData from './ProductStructuredData';
import { ShoppingCart, Heart, Eye, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils'; // <-- تابع جدید را وارد کنید

export default function ProductCard({ product }: { product: Product }) {
  const [likes, setLikes] = useState(product.total_likes);
  const [userLiked, setUserLiked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
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
        <div className="absolute inset-x-0 bottom-0 flex transform flex-col justify-end p-6 text-white transition-transform duration-500 group-hover:translate-y-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="relative z-10 translate-y-full space-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <Link href={`/product/${product.id}`}><h3 className="text-xl font-bold">{product.name}</h3></Link>
            <p className="text-sm text-gray-200 line-clamp-2">{product.description}</p>
            
            {/* نمایش برند محصول */}
            {product.brand_tag && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-300" />
                <span className="text-sm text-gray-300">{product.brand_tag}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => (<span key={i} className={i < Math.round(product.average_rating || 0) ? 'text-yellow-400' : 'text-gray-500'}>★</span>))}</div>
              <span className="text-xs text-gray-300">({product.total_reviews} نظر)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {product.discount_percentage && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
                <span className="mr-2 text-lg font-bold text-green-400">{formatPrice(finalPrice)}</span>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${product.stock_quantity > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{product.stock_quantity > 0 ? 'موجود' : 'ناموجود'}</span>
            </div>
            
            {/* === اینجا دکمه‌های جدید و مدرن قرار دارند === */}
            <div className="flex items-center justify-between gap-3 pt-2">
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
               {/* دکمه جدید جزییات محصول */}
  <Link
    href={`/products/${product.id}`}
    className="group flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-700 transition-all duration-300 hover:border-indigo-500 hover:text-indigo-600 hover:scale-110 active:scale-95"
  >
    <Eye className="w-5 h-5" />
  </Link>
              <button
                onClick={handleLike}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  userLiked ? 'border-red-400' : ''
                } ${isLiking ? 'scale-125' : ''}`}
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-300 ${
                    userLiked ? 'fill-red-500 text-red-500' : 'text-white'
                  } ${isLiking ? 'animate-ping' : ''}`}
                />
              </button>
            </div>
            {/* ============================================= */}
            
            <p className="text-center text-xs text-gray-300">{likes} نفر این محصول را دوست داشتند</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-4 transition-opacity duration-500 group-hover:opacity-0">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          {product.brand_tag && (
            <p className="text-sm text-white/80">{product.brand_tag}</p>
          )}
        </div>
      </div>
    </>
  );
}