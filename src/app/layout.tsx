import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/utils/constants";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  preload: true,
});

const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const mono = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: `${APP_NAME} · ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
