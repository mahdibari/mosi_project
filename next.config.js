/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'gbdyflffztuujzzabobv.supabase.co',
      'via.placeholder.com',
      'images.unsplash.com'
    ],
  },
  remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gbdyflffztuujzzabobv.supabase.co' ,// آدرس دامنه سوپابیس خود را اینجا قرار دهید
        port: '',
        pathname: '/storage/v1/object/**',
      },
      // اگر عکس‌ها از جای دیگر هم می‌آیند اینجا اضافه کنید
    ],
};

module.exports = nextConfig;


