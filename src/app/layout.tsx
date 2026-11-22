import type { Metadata, Viewport } from "next";
import ThemeSync from "@/components/ThemeSync";
import { Newsreader, Public_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { PALETTE } from "@/lib/palette";

// Two faces, chosen in DESIGN.md. Newsreader sets headings: a text serif
// with optical sizes, so it stays crisp at 28px and holds together at 84px.
// Public Sans sets everything else: plain, sturdy, with tabular figures for
// hours and dates. Both are self-hosted by next/font.
const display = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const text = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cliniclogmd.com"),
  title: "ClinicLog MD",
  description: "Log clinical hours for AMCAS and compare medical schools with your numbers. Built for Wake Forest pre-med students.",
  // Every tab, shared link and installed icon reads "ClinicLog MD" and nothing
  // else, so pages set no title of their own and there is no title template.
  openGraph: { title: "ClinicLog MD", siteName: "ClinicLog MD", type: "website" },
  twitter: { card: "summary_large_image", title: "ClinicLog MD" },
};

// Next.js 16 emits <meta name="viewport" content="..."> from this export.
// Forces every page (including post-signout landing) to render at native
// 1.0 scale. No maximumScale or minimumScale set, since those would
// constrain pinch-zoom which is undesirable here.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PALETTE.paper },
    { media: "(prefers-color-scheme: dark)", color: PALETTE.black },
  ],
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
      className={`${display.variable} ${text.variable} h-full antialiased`}
      // The theme script writes data-theme before React hydrates, so the
      // server and client markup differ on <html> by design.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: without it the light theme renders for a
            frame before the stored preference is applied. A stored choice
            wins; the OS setting is only the default on a first visit. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('cliniclog-theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: "var(--background)", color: "var(--text)" }}
      >
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
