import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://likitha-jeevan-wedding-2026.advitodev.chatgpt.site"),
  title: "Likitha & Jeevan | Wedding Invitation",
  description: "Join the wedding celebrations of Likitha S. and Jeevan B.K. on 3 December 2026 at Suvidha Resort, Bengaluru. Open the temple doors and explore our illustrated wedding invitation, celebrations and venue details.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Likitha & Jeevan | Wedding Invitation",
    description: "Together with our families, we invite you to celebrate with us. 3 December 2026 · Suvidha Resort, Bengaluru.",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/images/story-day.webp", width: 1080, height: 1919, alt: "A traditional temple entrance for Likitha and Jeevan's wedding invitation" }],
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
