// app/api/payment/checkout/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    // 1. دریافت اطلاعات سفارش از دیتابیس 
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, users(email, first_name, last_name)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });

    // 2. آماده‌سازی داده‌ها برای BitPay [cite: 41, 43]
    const payload = {
      api: process.env.BITPAY_API_KEY, // کلید 52 کاراکتری [cite: 45]
      amount: Math.round(order.total_amount * 10), // تبدیل تومان به ریال (اگر دیتابیس تومان است) 
      redirect: encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`), // 
      factorId: order.id, // 
      email: order.users?.email || "", // 
      name: `${order.users?.first_name || ""} ${order.users?.last_name || ""}`.trim(), // 
    };

    // 3. ارسال درخواست به درگاه [cite: 40]
    const response = await fetch("https://bitpay.ir/payment/gateway-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const id_get = await response.text();

    // 4. بررسی پاسخ (اگر عدد مثبت بود، موفق است) [cite: 47]
    if (Number(id_get) > 0) {
      return NextResponse.json({ url: `https://bitpay.ir/payment/gateway-${id_get}-get` }); // [cite: 48, 49]
    } else {
      return NextResponse.json({ error: "خطا در اتصال به درگاه", code: id_get }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}