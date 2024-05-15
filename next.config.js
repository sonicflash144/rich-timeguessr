module.exports = {
    async rewrites() {
      return [
        {
          source: '/python/:path*',
          destination: 'http://127.0.0.1:5328/:path*', // Proxy to Backend
        },
      ]
    },
  }