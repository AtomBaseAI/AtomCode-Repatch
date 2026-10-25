/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'ik.imagekit.io',
            pathname: '**',
          },
          {
            protocol: 'https',
            hostname: '**',
            pathname: '**',
          },
        ],
      },
  }