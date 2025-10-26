import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { AuthProvider } from "@/providers/AuthProvider";

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: "--font-lato",
  display: 'swap',
});

const latoMono = Lato({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  variable: "--font-lato-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Eduflow - AI-Powered Learning Platform",
  description: "Transform your educational content with AI-powered transcription, notes, and flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${lato.variable} ${latoMono.variable} antialiased`}
      >
        <AuthProvider>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
