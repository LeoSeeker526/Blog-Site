import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern blogging platform built with Next.js and tRPC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
