export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-indigo-300"> فروشگاه محصولات مراقبت پوستی</h3>
            <p className="text-gray-400">
             منبع مطمئن شما برای خرید محصولات آرایشی و بهداشتی با کیفیت
            </p>
            <a 
        referrerPolicy='origin' 
        target='_blank' 
        href='https://trustseal.enamad.ir/?id=690006&Code=BYndhTQbxZTbSk0JQxu6LOEXlnA9ss1g'
      >
        <img 
          referrerPolicy='origin' 
          src='https://trustseal.enamad.ir/logo.aspx?id=690006&Code=BYndhTQbxZTbSk0JQxu6LOEXlnA9ss1g' 
          alt='' 
          style={{cursor: 'pointer'}}
        />
      </a>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-300">لینک‌های مفید</h3>
            <ul className="space-y-2 text-gray-400">
            
              <li><a href="/about" className="hover:text-white">درباره ما</a></li>
              <li><a href="/contact" className="hover:text-white">تماس با ما</a></li>
             
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4 text-indigo-300">تماس با ما</h3>
            <p className="text-gray-400">
              <br />
              تلفن:09051415639
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500">
          <p>© ۲۰۲۵ . تمامی حقوق محفوظ است.</p>
        </div>
      </div>
      
    </footer>
  );
}