/** @type {import('next').NextConfig} */
const config = {
  allowedDevOrigins: ['https://sturdy-space-goggles-vxvx4q6wgg6c9qqq-9002.app.github.dev'],
  modularizeImports: {
    "date-fns": {
      transform: "date-fns/{{member}}",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });
    return config;
  },
  turbopack: {},
};

module.exports = config;
