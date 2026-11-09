import type { Metadata } from "next";
import "./globals.css";

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (productionHost
  ? `https://${productionHost}`
  : "https://likitha-jeevan-wedding-2026.advitodev.chatgpt.site");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Likitha & Jeevan | Wedding Invitation",
  description: "Join the wedding celebrations of Likitha S. and Jeevan B.K. on 3 December 2026 at Suvidha Resort, Bengaluru. Open the temple doors and explore our illustrated wedding invitation, celebrations and venue details.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Likitha & Jeevan | Wedding Invitation",
    description: "Together with our families, we invite you to celebrate with us. 3 December 2026 · Suvidha Resort, Bengaluru.",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/og-wedding-landscape.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Likitha and Jeevan wedding invitation — 3 December 2026, framed by a traditional floral temple entrance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Likitha & Jeevan | Wedding Invitation",
    description: "3 December 2026 · Suvidha Resort, Bengaluru. Join our wedding celebrations.",
    images: ["/images/og-wedding-landscape.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
