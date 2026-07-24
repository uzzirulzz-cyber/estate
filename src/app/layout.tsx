import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "PropertyAtlas — Luxury Real Estate Lifestyle",
  description: "PropertyAtlas.lifestyle — a premium real estate marketplace for buying, renting and investing in luxury properties. Exclusive listings, off-plan projects, and a full enterprise admin console.",
  keywords: ["PropertyAtlas", "PropertyAtlas Lifestyle", "luxury real estate", "properties for sale", "rentals", "ongoing projects", "property management"],
  authors: [{ name: "PropertyAtlas" }],
  icons: {
    icon: "/propertyatlas-logo.png",
  },
  openGraph: {
    title: "PropertyAtlas — Luxury Real Estate Lifestyle",
    description: "Premium properties for sale, rentals and off-plan projects.",
    siteName: "PropertyAtlas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
