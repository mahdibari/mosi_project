// File: contexts/CartContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { type User } from '@supabase/supabase-js';
import { Product } from '@/types';
import Notification from '@/components/Notification';

// تعریف نوع داده برای محصول با در نظر گرفتن null از دیتابیس
interface CartItemProduct extends Omit<Product, 'discount_percentage' | 'image_url'> {
  discount_percentage?: number | null;
  image_url?: string | null;
}

interface CartItem {
  id: string; // برای کاربران مهمان می‌تواند یک رشته تصادفی باشد
  product_id: string;
  quantity: number;
  product: CartItemProduct;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  notification: { message: string; isVisible: boolean } | null;
  showNotification: (message: string) => void;
  hideNotification: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  isLoading: false,
  notification: null,
  showNotification: () => {},
  hideNotification: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; isVisible: boolean } | null>(null);

  // فرمول‌های محاسباتی (بدون تغییر)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => {
      const price = item.product.discount_percentage 
        ? item.product.price * (1 - item.product.discount_percentage / 100) 
        : item.product.price;
      return sum + price * item.quantity;
    },
    0
  );

  // دریافت وضعیت کاربر
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // دریافت آیتم‌های سبد خرید (از دیتابیس یا لوکال استوریج)
  useEffect(() => {
    if (!user) {
      // اگر کاربر مهمان است، از localStorage بخوان
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          setCartItems(JSON.parse(guestCart));
        } catch (e) {
          console.error('Error parsing guest cart:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsLoading(false);
      return;
    }

    // اگر کاربر لاگین است، از دیتابیس بخوان
    const fetchCartItems = async () => {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:products(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setCartItems(data || []);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  // تابع کمکی برای ذخیره در localStorage (برای مهمانان)
  const saveGuestCart = (items: CartItem[]) => {
    localStorage.setItem('guest_cart', JSON.stringify(items));
  };

  const showNotification = (message: string) => {
    setNotification({ message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const addToCart = async (product: Product, quantity = 1) => {
    // حذف محدودیت لاگین، کاربر مهمان می‌تواند خرید کند
    
    try {
      const existingItem = cartItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        let newItem: CartItem;

        if (user) {
          // منطق دیتابیس برای کاربر لاگین
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity,
            })
            .select(`
              *,
              product:products(*)
            `);

          if (error) throw error;
          if (data && data.length > 0) {
            newItem = data[0];
            setCartItems(prev => [...prev, newItem]);
            showNotification(`${product.name} با موفقیت به سبد خرید اضافه شد.`);
          }
        } else {
          // منطق LocalStorage برای کاربر مهمان
          newItem = {
            id: `local-${Date.now()}-${Math.random()}`, // تولید یک ID منحصر به فرد
            product_id: product.id,
            quantity,
            product: product as CartItemProduct
          };
          const updatedCart = [...cartItems, newItem];
          setCartItems(updatedCart);
          saveGuestCart(updatedCart);
          showNotification(`${product.name} به سبد خرید اضافه شد.`);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      let errorMessage = 'خطایی در افزودن به سبد خرید رخ داد. لطفاً دوباره تلاش کنید.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showNotification(errorMessage);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user) {
      // منطق دیتابیس
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
        
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        showNotification('محصول از سبد خرید حذف شد.');
      } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('خطایی در حذف از سبد خرید رخ داد.');
      }
    } else {
      // منطق LocalStorage
      const updatedCart = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedCart);
      saveGuestCart(updatedCart);
      showNotification('محصول از سبد خرید حذف شد.');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (user) {
      // منطق دیتابیس
      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);

        if (error) throw error;
        
        setCartItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        showNotification('خطایی در به‌روزرسانی سبد خرید رخ داد.');
      }
    } else {
      // منطق LocalStorage
      const updatedCart = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartItems(updatedCart);
      saveGuestCart(updatedCart);
    }
  };

  const clearCart = async () => {
    if (user) {
      // منطق دیتابیس
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        
        setCartItems([]);
        showNotification('سبد خرید خالی شد.');
      } catch (error) {
        console.error('Error clearing cart:', error);
        showNotification('خطایی در خالی کردن سبد خرید رخ داد.');
      }
    } else {
      // منطق LocalStorage
      setCartItems([]);
      localStorage.removeItem('guest_cart');
      showNotification('سبد خرید خالی شد.');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
      <Notification
        message={notification?.message || ''}
        isVisible={notification?.isVisible || false}
        onClose={hideNotification}
      />
    </CartContext.Provider>
  );
};