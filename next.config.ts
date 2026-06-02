import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.cache = false; // تعطيل الكاش في وضع الإنتاج
    }
    return config;
  },
};

export default nextConfig;