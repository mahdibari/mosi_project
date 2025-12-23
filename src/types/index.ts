// File: types.txt

export interface User {
  id: string;
  phone: string; // تغییر از email به phone
  first_name?: string; // اضافه شدن
  last_name?: string; // اضافه شدن
  email?: string; // اختیاری کردن ایمیل
  created_at: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string; // ایمیل را اختیاری نگه می‌داریم
  created_at: string;
}


export interface Brands {
  id: string;
  name: string;
  logo_url?: string;
  description : string;
  created_at: string;
  slug : string
}


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
  discount_percentage?: number | null;
  stock_quantity: number;
  is_bestseller?: boolean | null;
  average_rating?: number | null;
  total_reviews: number;
  total_likes: number;
  category_id?: string | null;
  created_at: string;
  brand_id : string | null;
  brand_tag : string | null;
} 

export interface Category {
  id: string;
  name: string;
  slug: string;
}

// --- تایپ‌های جدید ---

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  postal_code: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  image_url?: string | null; // فیلد جدید برای عکس
  total_likes: number;
  created_at: string;
}
