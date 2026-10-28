import type { NextConfig } from "next";

// The Content-Security-Policy header is set per request in src/proxy.ts,
// because it carries a fresh script nonce each time.

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Source maps would publish the original source of a site whose repo also
  // happens to be public; there is no reason to ship them to browsers.
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // API responses carry per-user data and must never be cached by a
      // browser or shared proxy.
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
