'use client';
//components/Cartitem.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatToToman } from '@/utils/formatPrice';

// اینترفیس با پشتیبانی از null
interface CartItemProps {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    discount_percentage?: number | null;
    image_url?: string | null;
    stock_quantity: number;
  };
}

export default function CartItem({ item }: { item: CartItemProps }) {
  const { updateQuantity, removeFromCart } = useCart();
  
  const finalPrice = item.product.discount_percentage 
    ? item.product.price * (1 - item.product.discount_percentage / 100) 
    : item.product.price;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.product.stock_quantity) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <article className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-gray-100 dark:border-gray-700">
      <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden">
        {item.product.image_url ? (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 150px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-xs">بدون تصویر</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <Link href={`/products/${item.product_id}`} className="text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {item.product.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            {item.product.discount_percentage && (
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                {formatToToman(item.product.price)}
              </span>
            )}
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatToToman(finalPrice)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={item.quantity >= item.product.stock_quantity}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="حذف از سبد"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
}