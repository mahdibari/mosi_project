'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import ProductCard from './ProductCard';
import { Product } from '@/types';

// استایل‌های ضروری Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface ProductSliderProps {
  products: Product[];
  title?: string;
}

export default function ProductSlider({ products, title }: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full py-10 px-4">
      {title && (
        <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            {title}
          </h2>
          <div className="h-[1px] flex-grow mx-4 bg-gray-100 dark:bg-gray-800"></div>
        </div>
      )}

      <Swiper
        dir="rtl"
        spaceBetween={20}
        slidesPerView={1.2} // در موبایل بخشی از محصول بعدی دیده شود
        centeredSlides={false}
        loop={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          // تنظیمات واکنش‌گرا
          640: {
            slidesPerView: 2.2,
          },
          1024: {
            slidesPerView: 3,
          },
          1280: {
            slidesPerView: 4,
          },
        }}
        className="mySwiper !pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          background-color: white;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          color: #4f46e5 !important;
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .swiper-pagination-bullet-active {
          background: #4f46e5 !important;
          width: 20px !important;
          border-radius: 5px !important;
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none !important; }
        }
      `}</style>
    </div>
  );
}