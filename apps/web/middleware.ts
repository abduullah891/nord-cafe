import { NextRequest, NextResponse } from "next/server";

/**
 * ADMIN SECRET URL PROTECTION
 * ─────────────────────────────────────────────────────────────────────────────
 * Set ADMIN_SECRET_TOKEN in your Vercel environment variables.
 * The admin portal will ONLY be accessible at:
 *   https://yourdomain.vercel.app/portal/{ADMIN_SECRET_TOKEN}
 *
 * Any other path under /portal/* returns a hard 404.
 * The attacker won't even know the route exists.
 *
 * Generate a new token: https://www.uuidgenerator.net/
 * Example: ADMIN_SECRET_TOKEN=nc-0114d2a8-d157-4f92-b3e8-f2c1a9d04e7b
 */
const SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN ?? "nc-dev-only";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /portal/* paths
  if (!pathname.startsWith("/portal")) {
    return NextResponse.next();
  }

  // Extract the token segment: /portal/{token}
  const segments = pathname.split("/").filter(Boolean); // ["portal", "token-value"]
  const submittedToken = segments[1] ?? "";

  // ❌ Token doesn't match → hard 404 (no hint the route even exists)
  if (submittedToken !== SECRET_TOKEN) {
    return new NextResponse(null, { status: 404 });
  }

  // ✅ Token matches → allow through with strict security headers
  const response = NextResponse.next();

  // Prevent search engines from indexing this page
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  // Prevent caching — each request must be fresh
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  response.headers.set("Pragma", "no-cache");

  // Prevent embedding in iframes (clickjacking protection)
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy — don't leak the secret URL in referrer headers
  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}

export const config = {
  // Run only on portal paths, skip static files
  matcher: ["/portal/:path*"],
};
