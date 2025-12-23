// File: components/ProductStructuredData.tsx

'use client';

import { Product } from '@/types'; // <-- این خط بسیار مهم است

interface ProductStructuredDataProps {
  product: Product; // حالا از تایپ اصلی استفاده می‌کند
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url, // حالا TypeScript می‌داند که image_url ممکن است null باشد
    "description": product.description,
    "sku": product.id,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": "نام برند شما"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.average_rating || 0, // برای امنیت بیشتر
      "reviewCount": product.total_reviews
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.mosishop.ir/product/${product.id}`,
      "priceCurrency": "IRR",
      "price": product.price,
      "priceValidUntil": "2024-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock_quantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}