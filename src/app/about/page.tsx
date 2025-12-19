// File: app/about/page.tsx

import Link from 'next/link';
//import Image from 'next/image';
import React from 'react'; // <--- React را وارد کنید
import { 
  Heart, 
  Award, 
  Users, 
  Sparkles, 
  Shield, 
  Target,
  ArrowRight,
  CheckCircle,
  
 
} from 'lucide-react';

// --- اینترفیس برای کامپوننت آیکون ---
type IconComponent = React.ComponentType<{ className?: string }>;

// کامپوننت کارت ویژگی با نوع صحیح
const ValueCard = ({ icon: Icon, title, description }: { icon: IconComponent; title: string; description: string }) => (
  <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 text-center border border-gray-100 hover:border-indigo-200">
    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// کامپوننت کارت اعضای تیم
//const TeamMemberCard = ({ name, role, imageSrc }: { name: string; role: string; imageSrc: string }) => (
  //<div className="group text-center">
   // <div className="relative mb-4 overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500">
     // <Image
       // src={imageSrc}
       // alt={name}
       //width={300}
       // height={300}
      //  className="object-cover group-hover:scale-110 transition-transform duration-500"
     // />
     // <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
   // </div>
   // <h4 className="text-lg font-bold text-gray-800">{name}</h4>
   // <p className="text-indigo-600 font-medium">{role}</p>
 // </div>
//);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 z-10"></div>
        <div className="absolute inset-0">
            {/*
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=1950&q=80"
            alt="Hero Background"
            fill
            className="object-cover"
            sizes="100vw"
          />
          */}
        </div>
        <div className="relative z-20 container mx-auto px-4 py-24 lg:py-32 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
            ما زیبایی را با <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">اصالت</span> به شما هدیه می‌دهیم
          </h1>
          <p className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
            در فروشگاه ما، ما به ارائه محصولات باکیفیت و طبیعی متعهد هستیم تا شما بهترین تجربه خرید را داشته باشید.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-6">
                داستان ما از <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">عشق به زیبایی</span> شروع شد
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                فروشگاه ما در سال ۱۳۹۸ با یک هدف ساده آغاز به کار کرد: ارائه بهترین و سالم‌ترین محصولات مراقبت از پوست که هم اثربخش و هم ایمن باشند. ما معتقدیم که هر فرد شایسته زیبایی طبیعی و درخشش پوستی سالم است.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                تیم ما از متخصصان پوست و علاقه‌مندان به دنیای زیبایی تشکیل شده که با دقت هر محصول را انتخاب می‌کنند تا از کیفیت و اصالت آن مطمئن شوند. ما با تأمین‌کنندگان معتبر در سراسر جهان همکاری می‌کنیم تا جدیدترین و بهترین محصولات را در اختیار شما قرار دهیم.
              </p>
              <div className="flex items-center space-x-2 space-x-reverse text-indigo-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>تضمین اصالت کالا</span>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl transform transition-all duration-500 group-hover:scale-105">
                {/* 
                <Image
                  src="https://images.unsplash.com/photo-1596462502278-7d38fe9c6d5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=800&q=80"
                  alt="Our Story"
                  width={600}
                  height={600}
                  className="rounded-2xl"
                />
                */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">ماموریت و چشم‌انداز ما</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ما برای ساختن آینده‌ای زیباتر و بااعتماد به نفس تلاش می‌کنیم
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl border border-indigo-200">
              <Target className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">ماموریت ما</h3>
              <p className="text-gray-700 leading-relaxed">
                ماموریت ما توانمندسازی شما برای انتخاب آگاهانه و ارائه محصولاتی است که نه تنها زیبایی می‌بخشد، بلکه به سلامت پوست شما نیز احترام می‌گذارد. ما می‌خواهیم تجربه خریدی لذت‌بخش، مطمئن و به‌یادماندنی برای شما خلق کنیم.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200">
              <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">چشم‌انداز ما</h3>
              <p className="text-gray-700 leading-relaxed">
                ما به دنبال تبدیل شدن به مورد اعتمادترین منبع آنلاین برای محصولات مراقبت از پوست در ایران هستیم. چشم‌انداز ما جهانی است که در آن هر کسی به راحتی به محصولات باکیفیت و اصیل دسترسی داشته باشد و با اطمینان کامل خرید کند.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">ارزش‌های اصلی ما</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              این اصول، راهنمای تمام تصمیمات و اقدامات روزمره ما هستند
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard
              icon={Shield}
              title="کیفیت بی‌نقص"
              description="ما فقط محصولاتی را عرضه می‌کنیم که خودمان از آن‌ها استفاده می‌کنیم و به کیفیتشان اطمینان کامل داریم."
            />
            <ValueCard
              icon={Users}
              title="رضایت مشتری"
              description="خوشحالی شما اولویت ماست. ما همیشه برای شنیدن نظراتتان و بهبود خدمات خود آماده‌ایم."
            />
            <ValueCard
              icon={Award}
              title="اصالت کالا"
              description="تضمین می‌کنیم تمام محصولات ما اورجینال و از تأمین‌کنندگان معتبر جهانی تهیه شده‌اند."
            />
            <ValueCard
              icon={Heart}
              title="عشق به زیبایی"
              description="ما عمیقاً به دنیای زیبایی علاقه‌مندیم و همواره در جستجوی بهترین و نوآورانه‌ترین محصولات هستیم."
            />
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
     {/* <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-4">با تیم ما آشنا شوید</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              پشت هر محصول موفق، تیمی از متخصصان دلسوز و باانگیزه قرار دارد
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TeamMemberCard
              name="سارا رضایی"
              role="بنیان‌گذار و مدیرعامل"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b332c1ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=400&q=80"
            />
            <TeamMemberCard
              name="امیر علی‌زاده"
              role="متخصص پوست و مو"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=400&q=80"
            />
            <TeamMemberCard
              name="مریم احمدی"
              role="کارشناس ارتباط با مشتریان"
              imageSrc="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=400&q=80"
            />
          </div>
        </div>
      </section> */}

      {/* Testimonial Section */}
    {/*  <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-3xl">
            <div className="bg-white p-8 lg:p-12 rounded-3xl">
              <Quote className="w-12 h-12 text-indigo-600 mb-4" />
              <p className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">تجربه خرید از این فروشگاه فوق‌العاده بود. محصولات همیشه اصیل و بسته‌بندی‌شان بی‌نقص است. به شدت توصیه می‌کنم</p>
              
              
              <div className="flex items-center">
                <Image
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=100&q=80"
                  alt="Customer"
                  width={50}
                  height={50}
                  className="rounded-full ml-4"
                />
                <div>
                  <h4 className="font-bold text-gray-800">علی رضایی</h4>
                  <p className="text-gray-600">مشتری وفادار</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">
            آماده‌اید که زیبایی خود را کشف کنید؟
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            همین امروز مجموعه ما را بررسی کنید و تفاوت کیفیت را احساس کنید.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-white text-indigo-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            مشاهده محصولات
            <ArrowRight className="w-5 h-5 mr-2" />
          </Link>
        </div>
      </section>

     
    </div>
  );
}