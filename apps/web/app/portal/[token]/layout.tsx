import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function AdminTokenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
