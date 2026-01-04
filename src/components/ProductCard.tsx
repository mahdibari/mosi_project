'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import ProductStructuredData from './ProductStructuredData';
import { 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  MessageCircle, 
  Package, 
  Tag, 
  Zap 
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Toast from './Toast';

export default function ProductCard({ product }: { product: Product }) {
  const [mounted, setMounted] = useState(false);
  const [likes, setLikes] = useState(product.total_likes || 0);
  const [userLiked, setUserLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addToCart } = useCart();
  
  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error'}>({
    show: false, msg: '', type: 'success'
  });

  useEffect(() => {
    setMounted(true);
    checkUserLikeStatus();
  }, []);

  const checkUserLikeStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('product_likes')
      .select('id')
      .eq('product_id', product.id)
      .eq('user_id', session.user.id)
      .single();

    if (data) setUserLiked(true);
  };

  const handleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setToast({ show: true, msg: 'لطفاً ابتدا وارد حساب خود شوید', type: 'error' });
      return;
    }

    setIsLiking(true);
    if (userLiked) {
      const { error } = await supabase
        .from('product_likes')
        .delete()
        .eq('product_id', product.id)
        .eq('user_id', session.user.id);

      if (!error) {
        setLikes(prev => prev - 1);
        setUserLiked(false);
      }
    } else {
      const { error } = await supabase
        .from('product_likes')
        .insert({ product_id: product.id, user_id: session.user.id });

      if (!error) {
        setLikes(prev => prev + 1);
        setUserLiked(true);
      }
    }
    setIsLiking(false);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(product);
      setToast({ show: true, msg: 'محصول به سبد خرید اضافه شد', type: 'success' });
    } catch (err) {
      setToast({ show: true, msg: 'خطا در افزودن به سبد', type: 'error' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!mounted) return null;

  const finalPrice = product.discount_percentage 
    ? product.price * (1 - product.discount_percentage / 100) 
    : product.price;

  return (
    <article className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none hover:-translate-y-2">
      <ProductStructuredData product={product} />
      
      {/* بخش تصویر و برند */}
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gray-50 dark:bg-gray-900">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* تگ برند */}
        {product.brand_tag && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
            <Tag size={12} className="text-indigo-600" />
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{product.brand_tag}</span>
          </div>
        )}

        {/* دکمه لایک */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`absolute top-3 left-3 p-3 rounded-2xl backdrop-blur-md transition-all active:scale-90 ${
            userLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart size={18} className={userLiked ? 'fill-current' : ''} />
        </button>
      </div>

      {/* جزئیات محصول */}
      <div className="mt-4 px-2 pb-2">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* آمار محصول (لایک، نظر، موجودی) */}
        <div className="flex items-center gap-4 mt-3 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Heart size={14} className="text-red-500" />
            <span className="text-xs font-medium">{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={14} className="text-blue-500" />
            <span className="text-xs font-medium">{product.total_reviews || 0}</span>
          </div>
          <div className="flex items-center gap-1 mr-auto">
            <Package size={14} className="text-amber-500" />
            <span className={`text-xs font-bold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} عدد` : 'ناموجود'}
            </span>
          </div>
        </div>

        {/* امتیاز */}
        <div className="flex items-center gap-1 mt-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {product.average_rating ? product.average_rating.toFixed(1) : 'جدید'}
          </span>
        </div>

        {/* قیمت و دکمه خرید */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount_percentage && product.discount_percentage > 0 && (
              <span className="text-xs text-gray-400 line-through mb-1">
                {product.price.toLocaleString()}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {finalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-gray-400">تومان</span>
            </div>
          </div>
 {/* دکمه مشاهده جزئیات (جدید) */}
            <Link 
              href={`/products/${product.id}`}
              className="p-3 lg:p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 flex items-center justify-center"
              title="مشاهده جزئیات"
            >
              <Eye size={20} />
            </Link>
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_quantity <= 0}
            className={`relative p-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center ${
              product.stock_quantity > 0 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </button>
        </div>
      </div>

      <Toast 
        isVisible={toast.show} 
        message={toast.msg} 
        type={toast.type} 
        onClose={() => setToast({...toast, show: false})} 
      />
    </article>
  );
}