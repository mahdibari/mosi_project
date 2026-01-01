export const formatToToman = (price: number): string => {
  // نمایش قیمت به ریال بدون تبدیل ارزی
  return `${price.toLocaleString('fa-IR')} تومن`;
};