import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import { ApolloProvider } from "@/Components/providers/ApolloProvider";

import { Toaster } from "@/Components/Ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "live bed",
  description: "live bed",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
    >
      <body>
        <ApolloProvider>
          <main className="flex-1">{children}</main>
          <Toaster />
        </ApolloProvider>
      </body>
    </html>
  );
}
