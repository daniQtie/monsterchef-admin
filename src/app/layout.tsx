import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { DevWatermark } from "@/components/DevWatermark";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces — variable serif with a foodie/editorial feel; replaces the default
// "all-bold-sans" look that makes dashboards feel like every other AI tool.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  // No `weight` when `axes` is set — Fraunces is loaded as a variable font so
  // every weight in font-weight CSS works.
});

export const metadata: Metadata = {
  title: "Monster Chef — University of Eastern Pangasinan",
  description:
    "Monster Chef — a VR Cookery simulator for the University of Eastern Pangasinan. Students cook in a virtual kitchen; teachers approve, review and watch them live.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Monster Chef",
    description: "VR Cookery Simulator — University of Eastern Pangasinan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16110d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain">
        <AuthProvider>{children}</AuthProvider>
        <DevWatermark />
      </body>
    </html>
  );
}
