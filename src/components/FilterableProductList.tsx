import { Product } from '@/types';
import ProductCard from './ProductCard';

interface FilterableProductListProps {
  products: Product[];
  activeFilter: { type: 'category' | 'brand' | 'special'; value: string | null };
}

export default function FilterableProductList({ products, activeFilter }: FilterableProductListProps) {
  
  const filtered = products.filter(p => {
    if (!activeFilter.value) return true;
    if (activeFilter.type === 'category') return p.category_id === activeFilter.value;
    if (activeFilter.type === 'brand') return p.brand_id === activeFilter.value;
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {filtered.length > 0 ? (
        filtered.map(product => <ProductCard key={product.id} product={product} />)
      ) : (
        <div className="col-span-full py-20 text-center text-gray-500">محصولی در این دسته‌بندی یافت نشد.</div>
      )}
    </div>
  );
}