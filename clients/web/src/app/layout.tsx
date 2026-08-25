import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "@/featuer/Home/Header";

export const metadata: Metadata = {
  title: "live bed",
  description: "live bed",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={` h-full antialiased`}>
      <body>
        <Header />

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
