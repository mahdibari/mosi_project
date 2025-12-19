// File: app/products/page.tsx

import ProductListClient from './ProductListClient';
import { supabaseServerClient } from '@/lib/supabase/server';

async function getProducts() {
  const supabase = supabaseServerClient();
  const { data: products, error } = await supabase
    .from('products')
    .select(`id, name, description, price, image_url, discount_percentage, stock_quantity, is_bestseller, average_rating, total_reviews, total_likes, created_at, category_id, brand_id, brand_tag`) // <-- brand_id و brand_tag اضافه شدند
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return products || [];
}

async function getCategories() {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data || [];
}

export default async function ProductListPage() {
  const products = await getProducts();
  const categories = await getCategories();

  // پاس دادن داده‌ها به کامپوننت کلاینت
  return <ProductListClient products={products} categories={categories} />;
}