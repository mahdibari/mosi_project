// File: app/brands/[slug]/page.tsx

import { supabaseServerClient } from '@/lib/supabase/server';
import { Product, Brands } from '@/types';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getBrand(slug: string): Promise<Brands | null> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('brands').select('*').eq('slug', slug).single();
  if (error) { console.error('Error fetching brand:', error); return null; }
  return data;
}

async function getBrandProducts(brandId: string): Promise<Product[]> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brand_id(id, name, slug, logo_url)
    `)
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching brand products:', error); return []; }
  return data || [];
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);
  
  if (!brand) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">برند یافت نشد</h1>
        <p className="text-gray-600 mb-6">متأسفانه برند مورد نظر شما در سیستم ما وجود ندارد.</p>
        <Link href="/brands" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          بازگشت به لیست برندها
        </Link>
      </div>
    );
  }
  
  const products = await getBrandProducts(brand.id);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/brands" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
          بازگشت به لیست برندها
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">محصولات برند {brand.name}</h1>
        {brand.description && (
          <p className="text-gray-600 mt-2 max-w-3xl">{brand.description}</p>
        )}
      </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">هیچ محصولی برای این برند یافت نشد.</p>
        </div>
      )}
    </div>
  );
}