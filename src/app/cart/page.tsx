'use client';

import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import Link from 'next/link';
import { ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { formatToToman } from '@/utils/formatPrice';

const SHIPPING_FEE = 250000; // ۲۵۰ هزار تومان

export default function CartPage() {
  const { cartItems, cartTotal, isLoading } = useCart();

  if (isLoading) return <div className="text-center py-20">در حال بارگذاری...</div>;
  if (cartItems.length === 0) return <div className="text-center py-20">سبد خرید خالی است</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-black mb-8 flex items-center gap-2">
        <ShoppingBag className="text-indigo-600" /> سبد خرید شما
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <aside className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold mb-6">خلاصه سفارش</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">مجموع محصولات:</span>
              <span className="font-bold">{formatToToman(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>هزینه ارسال:</span>
              <span className="font-bold">{formatToToman(SHIPPING_FEE)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-lg font-black text-indigo-600">
              <span>مبلغ قابل پرداخت:</span>
              <span>{formatToToman(cartTotal + SHIPPING_FEE)}</span>
            </div>
          </div>
          <Link href="/checkout" className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            ادامه فرآیند خرید <ArrowRight size={20} />
          </Link>
        </aside>
      </div>
    </main>
  );
}