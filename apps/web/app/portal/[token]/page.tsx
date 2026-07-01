/**
 * DOUBLE-LOCK: Server Component token validation
 * ─────────────────────────────────────────────────────────────────────────────
 * Layer 1: middleware.ts blocks wrong URLs before Next.js even routes them.
 * Layer 2: This server component does a second check using the secret env var.
 *           Even if middleware is somehow bypassed, the server still rejects.
 *
 * The client dashboard (AdminClient.tsx) is NEVER rendered for wrong tokens.
 */
import { notFound } from "next/navigation";
import AdminClient from "./AdminClient";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AdminPortalPage({ params }: Props) {
  const { token } = await params;

  // Server-side secret — never sent to browser, safe from client inspection
  const SECRET = process.env.ADMIN_SECRET_TOKEN ?? "nc-dev-only";

  // Wrong token → render Next.js 404 page (same as any non-existent route)
  if (token !== SECRET) {
    notFound();
  }

  // Token verified server-side ✅ — now render the client dashboard
  return <AdminClient />;
}
