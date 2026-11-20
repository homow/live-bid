"use client";

import { useState } from "react";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSlidbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#151923]">
      <DashboardSidebar isOpen={isMenuOpen} onClose={handleMenuClose} />

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={handleMenuClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <div className="min-h-screen lg:pl-[250px]">
        <DashboardHeader onMenuClick={handleMenuOpen} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
