// app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  if (!trans_id || !id_get) {
    return NextResponse.redirect(new URL('/payment/success?status=error', request.url));
  }

  const verificationResult = await verifyBitpayPayment(id_get, trans_id);

  if (verificationResult.success) {
    // در اینجا سفارش را در دیتابیس "پرداخت شده"标记 کنید
    // const supabase = supabaseServerClient();
    // await supabase.from('orders').update({ status: 'paid' }).eq('authority', id_get);
    
    return NextResponse.redirect(new URL('/payment/success?status=success', request.url));
  } else {
    return NextResponse.redirect(new URL('/payment/success?status=failed', request.url));
  }
}

async function verifyBitpayPayment(id_get: string, trans_id: string): Promise<{ success: boolean; error?: string }> {
  const API_KEY = 'YOUR-BITPAY-API-KEY'; // <<<<<< کلید API خود را اینجا قرار دهید
  const AMOUNT = 50000; // <<<<<< مبلغ دقیق خرید به ریال را اینجا قرار دهید

  const params = new URLSearchParams();
  params.append('api', API_KEY);
  params.append('trans_id', trans_id);
  params.append('amount', AMOUNT.toString());

  try {
    const response = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    if (responseText.includes('تراکنش با موفقیت انجام شد')) {
      return { success: true };
    } else {
      return { success: false, error: responseText };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}
