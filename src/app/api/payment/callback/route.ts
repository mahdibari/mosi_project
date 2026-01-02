import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trans_id = searchParams.get('trans_id');
  const id_get = searchParams.get('id_get');

  if (!trans_id || !id_get) return NextResponse.json({ error: 'Data missing' });

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ۱. استعلام از بیت‌پی
    const verifyRes = await fetch('https://bitpay.ir/payment/gateway-result-second', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api: process.env.BITPAY_API_KEY!,
        id_get: id_get,
        trans_id: trans_id
      }).toString()
    });

    const resText = await verifyRes.text();

    // ۲. بررسی موفقیت (اگه پاسخ ۱ بود یا شامل وضعیت ۱ بود)
    const isOk = resText === '1' || resText.includes('"status":1');

    if (isOk) {
      // ۳. پیدا کردن و آپدیت سفارش به SUCCESS
      // اینجا هم با trans_id چک می‌کنیم هم با id_get که مو لای درزش نره
      const { data: updatedData, error: dbError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'SUCCESS',
          payment_status: 'SUCCESS',
          trans_id: trans_id
        })
        .or(`id_get.eq.${id_get},trans_id.eq.${trans_id}`)
        .select();

      if (dbError || !updatedData?.length) {
        return NextResponse.json({ error: 'پرداخت شد ولی دیتابیس پیدا نشد یا آپدیت نشد', log: dbError });
      }

      return NextResponse.redirect(new URL(`/payment-result?status=success&ref=${trans_id}`, request.url));
    } else {
      return NextResponse.json({ error: 'Bank Rejected', raw: resText });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}