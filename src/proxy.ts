import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

// The only third-party origin the browser talks to is this project's Supabase
// instance. Gemini and Resend are called from server routes only. Pinned to
// the project host rather than *.supabase.co so an injected script cannot
// send data to an attacker-owned Supabase project.
const supabaseOrigins = (() => {
  try {
    const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
    return host ? `https://${host} wss://${host}` : "https://*.supabase.co";
  } catch {
    return "https://*.supabase.co";
  }
})();

// Scripts run only with this request's nonce: an injected <script> or inline
// handler cannot guess it. Next.js reads the nonce from the request's CSP
// header and stamps it on its own scripts. Styles keep 'unsafe-inline'
// because the UI uses style attributes, which a nonce cannot cover.
function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
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
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);

  // Rebuilt from request.headers each time so cookies refreshed by Supabase
  // below still reach the page being rendered.
  const next = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    return NextResponse.next({ request: { headers } });
  };

  let supabaseResponse = next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = next();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — do not remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public allow-list. Everything else requires a verified session, so a route
  // added later is protected by default instead of depending on someone
  // remembering to add it here (the previous deny-list had already drifted:
  // six authenticated sections were missing from it).
  const path = request.nextUrl.pathname;
  const PUBLIC_EXACT = new Set(["/", "/about", "/changelog", "/badge", "/privacy", "/terms", "/icon"]);
  const PUBLIC_PREFIXES = ["/auth/"];
  // API routes authenticate themselves and must answer 401 JSON, not an HTML
  // redirect, so the proxy leaves them alone.
  const isApi = path.startsWith("/api/");
  const isPublic = PUBLIC_EXACT.has(path) || PUBLIC_PREFIXES.some((p) => path.startsWith(p));
  const isProtected = !isPublic && !isApi;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "";
    return withCsp(NextResponse.redirect(url), csp);
  }

  // Email must be verified before using any authenticated page.
  if (user && isProtected && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify-email";
    url.search = "";
    return withCsp(NextResponse.redirect(url), csp);
  }

  // Authenticated pages hold personal data: never let a shared cache keep them.
  if (isProtected) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return withCsp(supabaseResponse, csp);
}

function withCsp(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
