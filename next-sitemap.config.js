/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://mosishop.ir',
  generateRobotsTxt: true, // این گزینه فایل robots.txt را هم تولید می‌کند
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/server-sitemap.xml'], // اگر از SSR استفاده می‌کنید
};