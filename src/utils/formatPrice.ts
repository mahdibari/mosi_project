export const formatToToman = (price: number): string => {
  const tomanPrice = price * 50000; // فرض بر نرخ دلار ۵۰ هزار تومان
  return `${tomanPrice.toLocaleString('fa-IR')} تومان`;
};