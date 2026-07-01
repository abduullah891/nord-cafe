import type { Metadata } from "next";

// Block search engine indexing completely
export const metadata: Metadata = {
  title: "Not Found",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
