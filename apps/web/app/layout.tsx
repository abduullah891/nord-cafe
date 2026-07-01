import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nord Cafe | Artisanal Menu",
  description:
    "Crafting moments of peace in the heart of the city. Discover our curated selection of artisanal roasts and handmade pastries.",
  keywords: ["coffee", "artisanal", "nord", "pastries", "menu"],
  openGraph: {
    title: "Nord Cafe | Artisanal Menu",
    description:
      "Your morning ritual, perfected. Explore Nord Cafe's handcrafted coffee menu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
