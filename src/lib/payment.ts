// lib/payment.ts
export async function goToBitpay(amount: number, user: any, productName: string) {
  const API_KEY = 'YOUR-BITPAY-API-KEY'; // <<<<<< کلید API خود را اینجا قرار دهید
  const callback_url = 'https://www.mosishop.ir/api/payment/callback';

  const params = new URLSearchParams();
  params.append('api', API_KEY);
  params.append('amount', amount.toString());
  params.append('redirect', callback_url);
  params.append('name', `${user.first_name} ${user.last_name}` || user.display_name);
  params.append('email', user.email);
  params.append('phone', user.phone || '');
  params.append('description', `خرید: ${productName}`);

  try {
    const response = await fetch('https://bitpay.ir/payment/gateway-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    if (responseText.startsWith('-1')) {
      const gatewayUrl = responseText.substring(3);
      // قبل از رفتن به درگاه، اطلاعات سفارش را در دیتابیس ذخیره کنید
      // const trans_id = gatewayUrl.split('trans_id=')[1];
      // await saveOrderToDatabase({ authority: trans_id, amount, user, productName });
      window.location.href = gatewayUrl;
    } else {
      alert('خطا در اتصال به درگاه: ' + responseText);
    }
  } catch (error) {
    alert('خطا در اتصال به درگاه');
  }
}