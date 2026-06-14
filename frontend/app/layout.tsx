import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: "BoyzTrade",
  description: "Learn to trade crypto with $10,000 in virtual funds. Real market data, zero risk.",
  icons: [{ rel: "icon", url: "/images/logo.jpeg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
