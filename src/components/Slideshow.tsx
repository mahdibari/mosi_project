// File: components/Slideshow.tsx

'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    title: "پوست شما، اولویت ماست",
    description: "محصولات باکیفیت و متنوع برای مراقبت از پوست شما"
  },
  {
    title: "تخفیف ویژه تابستانی",
    description: "تا ۵۰٪ تخفیف روی محصولات منتخب"
  },
  {
    title: "محصولات ارگانیک و طبیعی",
    description: "بدون مواد شیمیایی مضر و مناسب انواع پوست"
  },
  {
    title: "تحویل فوری در سراسر کشور",
    description: "سفارش خود را ثبت و در کمترین زمان دریافت کنید"
  },
  {
    title: "مشاوره رایگان پوستی",
    description: "کارشناسان ما آماده ارائه مشاوره تخصصی به شما هستند"
  }
];

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // تغییر اسلاید هر 5 ثانیه

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-12 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="transition-opacity duration-1000 ease-in-out">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{slides[currentSlide].title}</h2>
          <p className="text-lg md:text-xl">{slides[currentSlide].description}</p>
        </div>
        
        <div className="flex justify-center mt-8 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}