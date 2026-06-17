import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CliniLog: Your Pre-Med Journey, Organized",
  description:
    "Track your clinical hours, explore 150+ medical schools, and build your path to medicine in one free tool.",
};

// Next.js 16 emits <meta name="viewport" content="..."> from this export.
// Forces every page (including post-signout landing) to render at native
// 1.0 scale. No maximumScale or minimumScale set, since those would
// constrain pinch-zoom which is undesirable here.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#000000", color: "#FFFFFF" }}>{children}</body>
    </html>
  );
}
