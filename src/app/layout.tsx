import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

// Not preloaded: the logged-out home page uses Archivo only, and a preload
// here would download Inter there for nothing. Signed-in pages swap it in.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cliniclogmd.com"),
  title: "ClinicLog MD",
  description: "Log clinical hours for AMCAS and compare medical schools with your numbers. Free for Wake Forest pre-med students.",
  openGraph: { siteName: "ClinicLog MD", type: "website" },
  twitter: { card: "summary_large_image" },
};

// Next.js 16 emits <meta name="viewport" content="..."> from this export.
// Forces every page (including post-signout landing) to render at native
// 1.0 scale. No maximumScale or minimumScale set, since those would
// constrain pinch-zoom which is undesirable here.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set by src/proxy.ts. Reading it also makes every page render per request,
  // which a nonce-based CSP requires: a prerendered page would carry no nonce.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

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
          nonce={nonce}
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
