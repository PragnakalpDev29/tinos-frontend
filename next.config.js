/** @type {import('next').NextConfig} */
const nextConfig = {
  // SECURITY: Explicitly disable source maps in production to prevent source code exposure
  productionBrowserSourceMaps: false,

  images: {
    unoptimized: true,
    // SECURITY: Removed dangerouslyAllowSVG to prevent SVG-based XSS attacks
    remotePatterns: [
      {
        protocol: 'https',
        // SECURITY: Restrict to known S3 bucket domains instead of allowing all domains ('**')
        hostname: '*.amazonaws.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // SECURITY: Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // SECURITY: Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // SECURITY: Enforce HTTPS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // SECURITY: Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // SECURITY: Restrict browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // SECURITY: Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://*.amazonaws.com",
              "font-src 'self'",
              "connect-src 'self' https://*.amazonaws.com https://tinostx.ai ws: wss:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/proxy/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/',
      },
    ]
  },
};

module.exports = nextConfig;
