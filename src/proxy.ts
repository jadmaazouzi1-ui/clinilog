import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
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
    return NextResponse.redirect(url);
  }

  // Email must be verified before using any authenticated page.
  if (user && isProtected && !user.email_confirmed_at) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify-email";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Authenticated pages hold personal data: never let a shared cache keep them.
  if (isProtected) {
    supabaseResponse.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
