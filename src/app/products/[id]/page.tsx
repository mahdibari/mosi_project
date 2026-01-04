'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  Star, 
  MessageSquare, 
  ShoppingCart, 
  Heart, 
  Send, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Loader2,
  Package,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Info,
  ChevronLeft,
  Percent,
  Award,
  TrendingUp,
  User as UserIcon,
  X
} from 'lucide-react';

// به‌روزرسانی اینترفیس Product برای شامل کردن دو عکس اضافی
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number | null;
  stock_quantity: number;
  image_url: string | null;
  image_url_2: string | null; // اضافه شده
  image_url_3: string | null; // اضافه شده
  average_rating: number;
  total_reviews: number;
  total_likes: number;
  is_bestseller: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    display_name: string;
  };
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  discount_percentage: number | null;
  image_url: string | null;
  average_rating: number;
  total_reviews: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingCart, setSubmittingCart] = useState(false);
  const [submittingLike, setSubmittingLike] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  // ریست کردن ایندکس عکس وقتی محصول تغییر می‌کند
  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  const fetchProductDetails = async (id: string) => {
    try {
      // دریافت تمام ستون‌ها شامل عکس‌های جدید
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`*`)
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);
      
      // Check if user has liked this product
      if (user) {
        const { data: likeData } = await supabase
          .from('product_likes')
          .select('*')
          .eq('product_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsLiked(!!likeData);
      }
      
      // Fetch product reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          users(display_name)
        `)
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      const transformedReviews = reviewsData.map(r => ({
        ...r,
        user: r.users
      }));
      setReviews(transformedReviews || []);
      
      // Fetch related products
      if (productData.category_id) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('id, name, price, discount_percentage, image_url, average_rating, total_reviews')
          .eq('category_id', productData.category_id)
          .neq('id', id)
          .limit(4);
        
        setRelatedProducts(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || !comment.trim()) return;
    
    setSubmittingReview(true);
    setError('');
    setSuccess('');

    try {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert([{ product_id: product.id, user_id: user.id, rating, comment }]);

      if (reviewError) throw reviewError;

      const newTotalReviews = product.total_reviews + 1;
      const newAverageRating = ((product.average_rating * product.total_reviews) + rating) / newTotalReviews;
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ total_reviews: newTotalReviews, average_rating: newAverageRating })
        .eq('id', product.id);

      if (updateError) throw updateError;

      setComment('');
      setRating(5);
      setSuccess('نظر شما با موفقیت ثبت شد.');
      setShowReviewForm(false);
      fetchProductDetails(product.id);
      setTimeout(() => setSuccess(''), 5000);
   
  
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLikeProduct = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    
    setSubmittingLike(true);
    setError('');
    const originalIsLiked = isLiked;
    const originalLikesCount = product.total_likes;

    setIsLiked(!originalIsLiked);
    setProduct(prev => prev ? { ...prev, total_likes: originalIsLiked ? prev.total_likes - 1 : prev.total_likes + 1 } : null);

    try {
      if (originalIsLiked) {
        const { error } = await supabase
          .from('product_likes')
          .delete()
          .eq('product_id', product.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_likes')
          .insert({ product_id: product.id, user_id: user.id });
        if (error) throw error;
      }
  
      setIsLiked(originalIsLiked);
      setProduct(prev => prev ? { ...prev, total_likes: originalLikesCount } : null);
      
     
    } finally {
      setSubmittingLike(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!product) return;

    setSubmittingCart(true);
    setError('');
    setSuccess('');

    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();
      
      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, quantity });
        if (error) throw error;
      }
      
      setSuccess('محصول با موفقیت به سبد خرید اضافه شد.');
      setTimeout(() => setSuccess(''), 5000);
   
    } finally {
      setSubmittingCart(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'normal') => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">محصول یافت نشد</h2>
          <p className="text-gray-600 mb-6">محصول مورد نظر شما وجود ندارد یا حذف شده است.</p>
          <Link href="/products" className="inline-flex items-center bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
            <ArrowRight className="w-5 h-5 ml-2 rotate-180" />
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.price * (1 - (product.discount_percentage || 0) / 100);
  const isInStock = product.stock_quantity > 0;

  // --- منطق جدید برای مدیریت چند عکس ---
  // ایجاد آرایه‌ای از تمام عکس‌های موجود و حذف مقادیر null
  const allImages = [
    product.image_url,
    product.image_url_2,
    product.image_url_3
  ].filter((img): img is string => img !== null);

  // اگر هیچ عکسی نبود، یک تصویر پیش‌فرض قرار بده
  const displayImages = allImages.length > 0 ? allImages : ['https://via.placeholder.com/600x600'];
  
  // اطمینان از اینکه ایندکس خارج از محدوده نیست
  const safeActiveIndex = Math.min(activeImageIndex, displayImages.length - 1);
  const currentImage = displayImages[safeActiveIndex] || displayImages[0];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Success/Error Notification */}
      {(success || error) && (
        <div className={`sticky top-0 z-50 p-4 text-center ${success ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          <div className="container mx-auto flex items-center justify-center">
            {success ? <CheckCircle className="w-5 h-5 ml-2" /> : <AlertCircle className="w-5 h-5 ml-2" />}
            <span>{success || error}</span>
            <button onClick={() => {setSuccess(''); setError('');}} className="mr-4">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-indigo-600 transition-colors">فروشگاه</Link>
          <ChevronLeft className="w-4 h-4 mx-2" />
          <Link href="/products" className="hover:text-indigo-600 transition-colors">محصولات</Link>
          {product.category && (
            <>
              <ChevronLeft className="w-4 h-4 mx-2" />
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-indigo-600 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronLeft className="w-4 h-4 mx-2" />
          <span className="text-gray-700 font-medium">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <div className="aspect-square relative overflow-hidden rounded-xl">
                <Image 
                  src={currentImage} 
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  priority
                />
                {/* Product Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_bestseller && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg flex items-center"><TrendingUp className="w-3 h-3 ml-1"/>پرفروش</span>}
                  {product.is_featured && <span className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg flex items-center"><Award className="w-3 h-3 ml-1"/>انتخاب ویژه</span>}
                  {product.discount_percentage && product.discount_percentage > 0 && <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg flex items-center"><Percent className="w-3 h-3 ml-1"/>{product.discount_percentage}%</span>}
                </div>
              </div>
            </div>
             {/* Image thumbnails */}
             {/* اگر بیشتر از یک عکس وجود داشت، لیست بندانگشتی را نمایش بده */}
            {displayImages.length > 1 && (
              <div className="flex gap-2 p-2 overflow-x-auto justify-start lg:justify-center">
                {displayImages.map((image, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveImageIndex(index)} 
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${safeActiveIndex === index ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Link href={`/products?category=${product.category.slug}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-1">{product.name}</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center">
                <span className="mr-2 text-gray-600 font-medium">({product.total_reviews})</span>
                {renderStars(Math.round(product.average_rating))}
                
              </div>
              <div className="flex items-center text-gray-500">
                <Heart className="w-5 h-5 mr-1" />
                <span>{product.total_likes} </span>
              </div>
            </div>
            
            <div className="flex items-baseline space-x-3 space-x-reverse">
              <span className="text-4xl font-bold text-gray-900">{finalPrice.toLocaleString()} <span className="text-lg font-normal">تومان</span></span>
              {product.discount_percentage && product.discount_percentage > 0 && (
                <span className="text-xl text-gray-400 line-through">{product.price.toLocaleString()} تومان</span>
              )}
            </div>
            
            <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            
            {/* Stock Status */}
            <div className={`p-4 rounded-lg flex items-center ${isInStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <Package className="w-6 h-6 ml-3" />
              <span className="font-semibold text-lg">
                {isInStock ? `موجود در انبار (موجودی: ${product.stock_quantity})` : 'ناموجود در انبار'}
              </span>
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 rounded-md transition-colors" disabled={!isInStock}><Minus className="w-5 h-5"/></button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border-0 focus:ring-0" disabled={!isInStock} />
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="p-2 hover:bg-gray-100 rounded-md transition-colors" disabled={!isInStock}><Plus className="w-5 h-5"/></button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!isInStock || submittingCart}
                className={`flex-1 py-3 px-8 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl ${
                  isInStock && !submittingCart
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {submittingCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5 ml-2" />}
                افزودن به سبد خرید
              </button>

              <button
                onClick={handleLikeProduct}
                disabled={submittingLike}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {submittingLike ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center text-gray-600"><Truck className="w-5 h-5 ml-2 text-indigo-600" />ارسال سریع و رایگان</div>
              <div className="flex items-center text-gray-600"><Shield className="w-5 h-5 ml-2 text-indigo-600" />ضمانت اصالت کالا</div>
              <div className="flex items-center text-gray-600"><RefreshCw className="w-5 h-5 ml-2 text-indigo-600" />7 روز ضمانت بازگشت</div>
              <div className="flex items-center text-gray-600"><Info className="w-5 h-5 ml-2 text-indigo-600" />پشتیبانی 24 ساعته</div>
            </div>
          </div>
        </div>
        
        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-12 overflow-hidden">
          <div className="flex border-b">
            <button className="flex-1 py-4 text-center font-semibold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50">توضیحات</button>
            <button className="flex-1 py-4 text-center font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-50">نظرات ({reviews.length})</button>
           
          </div>
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-4">معرفی محصول</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
           
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-6 h-6 ml-3 text-indigo-600" />
              نظرات کاربران
            </h2>
            {user && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="bg-indigo-100 text-indigo-700 py-2 px-6 rounded-lg font-semibold hover:bg-indigo-200 transition-colors">
                ثبت نظر شما
              </button>
            )}
          </div>

          {/* Review Form */}
          {user && showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">نظر خود را ثبت کنید</h3>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">امتیاز شما</label>
                {renderStars(rating, true)}
              </div>
              <div className="mb-4">
                <label htmlFor="comment" className="block text-gray-700 mb-2">متن نظر</label>
                <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submittingReview} className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center">
                  {submittingReview ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Send className="w-5 h-5 ml-2" />}
                  ثبت نظر
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  انصراف
                </button>
              </div>
            </form>
          )}
          
          {!user && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <UserIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <p className="text-blue-800 font-semibold mb-3">برای ثبت نظر، لطفاً وارد حساب کاربری خود شوید.</p>
              <Link href="/auth/login" className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                ورود / ثبت‌نام
              </Link>
            </div>
          )}
          
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center ml-4 flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-gray-500"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">{review.user?.display_name || 'کاربر مهمان'}</h4>
                      <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                    {renderStars(review.rating, false, 'small')}
                    <p className="text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-center text-gray-500 py-8">هیچ نظری برای این محصول ثبت نشده است.</p>}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-8">محصولات مرتبط</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                      <div className="aspect-square relative">
                        <Image src={relatedProduct.image_url || 'https://via.placeholder.com/300x300'} alt={relatedProduct.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" />
                      </div>
                      {relatedProduct.discount_percentage && relatedProduct.discount_percentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">%{relatedProduct.discount_percentage}</div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      {renderStars(Math.round(relatedProduct.average_rating), false, 'small')}
                      <span className="font-bold text-indigo-600">
                        {relatedProduct.discount_percentage && relatedProduct.discount_percentage > 0 ? (
                          (relatedProduct.price * (1 - relatedProduct.discount_percentage / 100)).toLocaleString()
                        ) : (
                          relatedProduct.price.toLocaleString()
                        )}
                        <span className="text-xs font-normal"> تومان</span>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}