// File: app/brands/page.tsx

import { supabaseServerClient } from '@/lib/supabase/server';
import { Brand } from '@/types';
import BrandCard from '@/components/BrandCard';

async function getBrands(): Promise<Brand[]> {
  const supabase = supabaseServerClient();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) { console.error('Error fetching brands:', error); return []; }
  return data || [];
}

export default async function BrandsPage() {
  const brands = await getBrands();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">برندها</h1>
      
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">هیچ برندی یافت نشد.</p>
        </div>
      )}
    </div>
  );
}