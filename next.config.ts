import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The only third-party origin the browser talks to is this project's Supabase
// instance. Gemini and Resend are called from server routes only, so they are
// deliberately absent. Pinned to the project host rather than *.supabase.co so
// a compromised script cannot exfiltrate to an attacker-owned Supabase project.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return "";
  }
})();
const supabaseOrigins = supabaseHost
  ? `https://${supabaseHost} wss://${supabaseHost}`
  : "https://*.supabase.co";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is only needed by the dev server's hot reload, never in a
  // production build. 'unsafe-inline' remains: Next inlines its hydration
  // payload, and removing it requires a per-request nonce (see audit notes).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigins}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Content-Security-Policy", value: csp },
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
