import type { Metadata } from "next";

import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/contexts/CartContext';

 // <-- CartProvider را وارد کنید
 // اگر SupabaseProvider دارید




export const metadata: Metadata = {
  title: ' مصی شاپ ',
  description: 'فروشگاه آنلاین محصولات مراقبت پوستی',
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
     
           <CartProvider>
          {children}
           
            </CartProvider>
          
       
          
          </main>
        <Footer />
      </body>
    </html>
  );
}
