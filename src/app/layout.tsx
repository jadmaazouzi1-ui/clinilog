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
  title: "ClinicLog MD",
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
      // The theme script writes data-theme before React hydrates, so the
      // server and client markup differ on <html> by design.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: without it the light theme renders for a
            frame before the stored preference is applied. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('cliniclog-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}",
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}
      >
        {children}
      </body>
    </html>
  );
}
