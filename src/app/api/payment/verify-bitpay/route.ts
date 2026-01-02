import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trans_id, id_get } = body;

    if (!trans_id || !id_get) {
      return NextResponse.json({ message: 'Missing transaction details' }, { status: 400 });
    }

    const BITPAY_API_KEY = process.env.BITPAY_API_KEY;
    if (!BITPAY_API_KEY) return NextResponse.json({ message: 'API Key missing' }, { status: 500 });

    // درخواست تایید به بیت‌پی
    const verifyUrl = 'https://bitpay.ir/payment/gateway-result-second';
    const formData = new URLSearchParams();
    formData.append('api', BITPAY_API_KEY);
    formData.append('id_get', id_get);
    formData.append('trans_id', trans_id);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Verify API Result:', result);

    // طبق داکیومنت: status=1 یعنی موفق
    if (result.status === 1) {
      // دقت کنید: در پاسخ JSON بیت‌پی نام فیلد factorId است نه order_id (هرچند بعضی نسخه ها order_id می‌فرستند)
      const orderId = result.order_id || result.factorId;

      if (orderId) {
        const supabase = supabaseServerClient();
        
        // آپدیت وضعیت سفارش به paid
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order:', updateError);
        }

        return NextResponse.json({ success: true, orderId });
      } else {
        return NextResponse.json({ success: false, message: 'Order ID not found in response.' });
      }
    } else {
      return NextResponse.json({ success: false, message: 'Payment verification failed.', result });
    }

  } catch (error: any) {
    console.error('Verify API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}