/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    localeDetection: true,
  },
  transpilePackages: ['@multi-shop/shared', '@multi-shop/ui', '@multi-shop/config'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  }
}

module.exports = nextConfig