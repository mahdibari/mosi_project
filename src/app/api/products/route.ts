// File: app/api/products/route.ts


import { supabaseServerClient } from '@/lib/supabase/server'; // فرض می‌کنیم شما یک کلاینت سرور دارید
import { NextResponse } from 'next/server';

export async function GET() {
  try {
     const supabase = supabaseServerClient(); // <-- فراخوانی تابع جدید

    // ابتدا کاربر را در سرور شناسایی می‌کنیم
    const { data: { user } } = await supabase.auth.getUser();

    // کوئری اصلی برای دریافت محصولات
    const productsQuery = supabase
      .from('products')
      .select(`
        id, name, description, price, image_url, discount_percentage,
        stock_quantity, is_bestseller, average_rating, total_reviews,
        total_likes
      `)
      .order('created_at', { ascending: false })
      .limit(12);

    const { data: products, error } = await productsQuery;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Could not fetch products' }, { status: 500 });
    }

    // اگر کاربر وارد کرده بود، لایک‌های او را نیز دریافت می‌کنیم
    let productIdsWithLikes: string[] = [];
    if (user) {
      const { data: likes } = await supabase
        .from('product_likes')
        .select('product_id')
        .eq('user_id', user.id);

      productIdsWithLikes = likes?.map(like => like.product_id) || [];
    }

    // ترکیب اطلاعات محصولات با وضعیت لایک کاربر
    const finalProducts = products?.map(p => ({
      ...p,
      average_rating: Number(p.average_rating) || 0,
      total_reviews: Number(p.total_reviews) || 0,
      total_likes: Number(p.total_likes) || 0,
      user_liked: productIdsWithLikes.includes(p.id),
    })) || [];

    // کش کردن پاسخ برای ۶۰ ثانیه
    return NextResponse.json(finalProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}