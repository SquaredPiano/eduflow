import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Providers } from "@/providers/Providers";
import { Toaster } from "sonner";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduFlow - AI-Powered Learning Platform",
  description: "Transform your educational content with AI-powered transcription, notes, and flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} font-sans antialiased`}>
        <Providers>
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
