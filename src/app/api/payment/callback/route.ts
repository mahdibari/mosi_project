import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // **اولین تغییر:**
    // مطمئن شو که متغیرهای محیطی تعریف شده‌اند و از پیشوند NEXT_PUBLIC_ استفاده کن
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL or Anon Key are not defined in environment variables.');
    }

    // ایجاد کلاینت Supabase در ابتدای هر درخواست POST
    // **دومین تغییر:**
    // از متغیرهای محیطی با پیشوند NEXT_PUBLIC_ استفاده کن
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    console.log('Received Authorization header:', authHeader);
    console.log('Received token:', token);

    if (!token) {
      return NextResponse.json({ message: 'توکن احراز هویت موجود نیست' }, { status: 401 });
    }

    // **سومین تغییر و اصلاح اصلی در منطق Supabase client:**
    // این قسمت برای ساخت کلاینت Supabase با توکن احراز هویت است
    // قبلاً اینجا هم از متغیرهای بدون NEXT_PUBLIC_ استفاده می‌شد
    // همچنین، به جای ساخت دو `supabase` و `supabaseWithAuth` جداگانه که هر دو از URL/Anon Key استفاده می‌کنند،
    // منطق بهتری این است که یک بار `supabase` عمومی را بسازید و اگر توکن بود، یک کلاینت جدید با توکن ایجاد کنید.
    // اما با توجه به اینکه شما از `supabaseWithAuth` برای عملیات‌های بعدی استفاده می‌کنی، این ساختار حفظ می‌شود
    // فقط متغیرها رو اصلاح می‌کنیم.
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, // تغییر یافته
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // تغییر یافته
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const body = await request.json();
    const { phone, postalCode, address, items } = body;

    if (!phone || !postalCode || !address || !items || !items.length) {
      return NextResponse.json({ message: 'اطلاعات سفارش ناقص است' }, { status: 400 });
    }

    // دریافت کاربر از توکن
    // **اطمینان حاصل کن که از supabaseWithAuth برای عملیات‌های نیازمند احراز هویت استفاده می‌کنی.**
    const { data: { user }, error: userError } = await supabaseWithAuth.auth.getUser();

    if (userError || !user) {
      console.error('User Auth Error:', userError); // اضافه کردن لاگ برای دیباگ بهتر
      return NextResponse.json({ message: 'کاربر احراز هویت نشده', detail: userError?.message }, { status: 401 });
    }

    // ثبت سفارش به همراه شناسه کاربر
    const { data: orderData, error: orderError } = await supabaseWithAuth // از supabaseWithAuth استفاده کن
      .from('orders')
      .insert([{ phone, postal_code: postalCode, address, user_id: user.id }])
      .select('id')
      .maybeSingle();

    if (orderError || !orderData) {
      console.error('Order Insert Error:', orderError);
      return NextResponse.json({ message: 'خطا در ثبت سفارش', detail: orderError?.message }, { status: 500 });
    }

    const orderId = orderData.id;

    // ثبت آیتم‌های سفارش
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseWithAuth.from('order_items').insert(orderItems); // از supabaseWithAuth استفاده کن

    if (itemsError) {
      console.error('Order Items Insert Error:', itemsError);
      return NextResponse.json({ message: 'خطا در ثبت آیتم‌های سفارش', detail: itemsError?.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'سفارش با موفقیت ثبت شد' });
  } catch (error: any) {
    console.error('Catch Block Error:', error); // اضافه کردن لاگ برای دیباگ بهتر
    return NextResponse.json({ message: error.message || 'خطا در ثبت سفارش' }, { status: 500 });
  }
}