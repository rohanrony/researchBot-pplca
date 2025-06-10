/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },

  serverExternalPackages: ['pdf-parse'],

  // For enabling file polling in Docker
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      // poll for changes every 1 second
      poll: 1000,
      // wait 300ms after change before rebuilding
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
