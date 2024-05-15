module.exports = {
  images: {
    domains: ['custom-timeguessr.s3.amazonaws.com'],
  },
    async rewrites() {
      return [
        {
          source: '/python/:path*',
          destination: 'http://127.0.0.1:5328/:path*', // Proxy to Backend
        },
      ]
    },
}