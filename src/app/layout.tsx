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
  title: "CliniLog — Your Pre-Med Journey, Organized",
  description:
    "Track your clinical hours, explore 150+ medical schools, and build your path to medicine — all in one free tool.",
};

// Next.js 16 emits <meta name="viewport" content="..."> from this export.
// Forces the landing page (and every page) to render at native scale on
// every device — no zoomed-out experience after sign out.
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
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "#1A1A2E", color: "#FFFFFF" }}>{children}</body>
    </html>
  );
}
