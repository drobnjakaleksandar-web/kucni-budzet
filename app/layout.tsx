import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kucni Budzet",
  description: "Zajednicke finansije pod kontrolom",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kućni Budžet",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body
        className={`${GeistSans.variable} antialiased`}
      >
        <div
          className="mx-auto max-w-[430px] min-h-screen bg-[var(--color-off-white)] relative md:shadow-2xl md:my-0"
        >
          {children}
        </div>
      </body>
    </html>
  );
}
