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
  async headers() {
    return [
      {
        // matching all API routes
        source: "/python/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
}