import HomePageContent from '@/components/HomePageContent';
import { supabaseServerClient } from '@/lib/supabase/server';
import { Product, Category, Brands } from '@/types';

async function getProducts(): Promise<Product[]> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brand_id(id, name, slug, logo_url)
    `)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching products:', error); return []; }
  return data || [];
}

async function getLatestArticles() {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, created_at, image_url')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return data || [];
}

async function getCategories(): Promise<Category[]> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) { console.error('Error fetching categories:', error); return []; }
  return data || [];
}

async function getBrands(): Promise<Brands[]> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) { console.error('Error fetching brands:', error); return []; }
  return data || [];
}

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories();
  const brands = await getBrands();
  const latestArticles = await getLatestArticles();
  return <HomePageContent products={products} categories={categories} brands={brands} latestArticles={latestArticles} />;
}