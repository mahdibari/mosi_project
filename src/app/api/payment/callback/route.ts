// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('--- PAYMENT CALLBACK ROUTE HIT ---'); // این لاگ باید در Vercel ظاهر شود
  
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get('id_get');
  const trans_id = searchParams.get('trans_id');

  if (!authority) {
    console.error('Callback Error: Authority (id_get) is missing.');
    return NextResponse.redirect(new URL('/payment/success?status=error', request.url));
  }

  // اینجا منطق تایید پرداخت شما قرار می‌گیرد
  // فعلاً برای تست، فرض می‌کنیم موفق است
  const verificationResult = { success: true, ref_id: trans_id };

  if (verificationResult.success) {
    console.log('Payment Verification: SUCCESS');
    const supabase = supabaseServerClient();
    
    // اگر جدول orders دارید، اینجا آپدیت کنید
    // const { error } = await supabase.from('orders').update({ status: 'paid' }).eq('authority', authority);

    const successUrl = new URL('/payment/success', request.url);
    successUrl.searchParams.set('status', 'success');
    return NextResponse.redirect(successUrl);
  } else {
    const failureUrl = new URL('/payment/success', request.url);
    failureUrl.searchParams.set('status', 'failed');
    return NextResponse.redirect(failureUrl);
  }
}
