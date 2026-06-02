import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // هذا السطر هو الأهم لأنه يخبر Next.js أن يبني نسخة مستقلة تعمل على السيرفر
  output: 'standalone', 
  
  // إعدادات إضافية اختيارية
  images: {
    unoptimized: true, // مهم جداً لأن Cloudflare Pages لا يدعم Image Optimization الافتراضي
  },
};

export default nextConfig;
