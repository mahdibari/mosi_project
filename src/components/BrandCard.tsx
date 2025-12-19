// File: components/BrandCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Brands } from '@/types';

export default function BrandCard({ brand }: { brand: Brands }) {
  return (
    <Link 
      href={`/brands/${brand.slug}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center justify-center"
    >
      <div className="relative w-24 h-24 mb-4">
        {brand.logo_url ? (
          <Image 
            src={brand.logo_url} 
            alt={brand.name} 
            fill 
            className="object-contain transition-transform duration-300 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-xl font-bold">{brand.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 text-center group-hover:text-indigo-600 transition-colors duration-300">
        {brand.name}
      </h3>
    </Link>
  );
}