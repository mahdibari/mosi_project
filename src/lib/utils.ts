// File: lib/utils.ts

/**
 * یک عدد را به فرمت قیمت تومان ایرانی با اعداد فارسی تبدیل می‌کند.
 * @param price - مقدار عددی قیمت.
 * @returns یک رشته فرمت‌دهی شده مانند "۱,۲۳۴,۵۶۷ تومان".
 */
export function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return '۰ تومان'; // یا یک مقدار پیش‌فرض دیگر
  }

  // استفاده از 'fa-IR' برای نمایش اعداد فارسی و جداکننده استاندارد هزارگان
  // متد toLocaleString در محیط‌های مدرن (مرورگر و Node.js) به خوبی پشتیبانی می‌شود.
  return `${price.toLocaleString('fa-IR')} تومان`;
}