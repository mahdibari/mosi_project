// File: app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { 
  User as UserIcon, 
  Heart, 
  LogOut, 

  Loader2,
  
  Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// اینترفیس برای محصولات لایک شده
interface LikedProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  discount_percentage: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<LikedProduct[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchLikedProducts = async () => {
        setLoadingLikes(true);
        const { data, error } = await supabase
          .from('product_likes')
          .select(`
            products (
              id, 
              name, 
              price, 
              image_url, 
              discount_percentage
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching liked products:', error);
        } else if (data) {
          // --- این خط را اصلاح کردیم ---
          const products = (data.map(item => item.products).filter(Boolean) as unknown) as LikedProduct[];
          
          setLikedProducts(products);
        }
        setLoadingLikes(false);
      };

      fetchLikedProducts();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <UserIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">لطفاً ابتدا وارد شوید</h2>
          <p className="text-gray-600 mb-6">برای مشاهده پروفایل، باید وارد حساب کاربری خود شوید.</p>
          <Link href="/auth/login" className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-xl hover:bg-indigo-700 transition-colors duration-200">
            ورود به حساب
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          پروفایل کاربری
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4 shadow-lg">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {user.user_metadata?.display_name || 'کاربر'}
                </h2>
                <p className="text-gray-600 flex items-center mb-6">
                  <Mail className="w-4 h-4 ml-2" />
                  {user.email}
                </p>
              </div>
              
              <div className="border-t pt-6 mt-6">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center font-semibold shadow-md"
                >
                  <LogOut className="w-5 h-5 ml-2" />
                  خروج از حساب
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <Heart className="w-7 h-7 text-red-500 ml-3 fill-current" />
                <h2 className="text-2xl font-bold text-gray-800">محصولات مورد علاقه</h2>
              </div>
              
              {loadingLikes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                </div>
              ) : likedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {likedProducts.map((product) => {
                    const finalPrice = product.price * (1 - product.discount_percentage / 100);
                    return (
                      <div key={product.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                        <Link href={`/products/${product.id}`}>
                          <div className="relative h-48 overflow-hidden bg-gray-100">
                            <Image
                              src={product.image_url || 'https://via.placeholder.com/300x200'} // این خط بعد از تغییر next.config.js کار می‌کند
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                            <div className="flex items-center justify-between">
                              {product.discount_percentage > 0 ? (
                                <>
                                  <span className="text-lg font-bold text-indigo-600">{finalPrice.toLocaleString()} تومان</span>
                                  <span className="text-sm text-gray-400 line-through">{product.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-indigo-600">{product.price.toLocaleString()} تومان</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500 mb-2">شما هنوز محصولی را لایک نکرده‌اید.</p>
                  <Link href="/products" className="text-indigo-600 hover:underline font-semibold">
                    مشاهده محصولات
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}