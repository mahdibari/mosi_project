import Link from 'next/link';

export default function PaymentResultPage({
  searchParams,
}: {
  searchParams: { status?: string; ref?: string; msg?: string };
}) {
  const isSuccess = searchParams.status === 'success';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">پرداخت موفق</h1>
            <p className="text-gray-600 mb-6">سفارش شما با موفقیت ثبت شد.</p>
            <div className="bg-gray-100 p-3 rounded-lg mb-6">
              <span className="text-sm text-gray-500 block">کد پیگیری:</span>
              <span className="font-mono text-lg font-bold">{searchParams.ref}</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">پرداخت ناموفق</h1>
            <p className="text-gray-600 mb-6">{searchParams.msg || 'مشکلی در پرداخت پیش آمد.'}</p>
          </>
        )}
        
        <Link href="/" className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          بازگشت به خانه
        </Link>
      </div>
    </div>
  );
}