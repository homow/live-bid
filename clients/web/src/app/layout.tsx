import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "@/Components/layout/Header";
import Footer from "@/Components/layout/Footer/Footer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "live bed",
  description: "live bed",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "font-sans", geist.variable)}>
      <body>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
