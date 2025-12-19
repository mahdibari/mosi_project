// File: components/FilterableProductList.tsx

import ProductCard from './ProductCard';
import { Product } from '@/types';

interface FilterableProductListProps {
  products: Product[];
}

export default function FilterableProductList({ products }: FilterableProductListProps) {
  return (
    <>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">هیچ محصولی برای این فیلتر یافت نشد.</p>
        </div>
      )}
    </>
  );
}