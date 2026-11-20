"use client";

import { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSlidbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#151923]">
      <DashboardSidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <div className="min-h-screen lg:pl-[250px]">
        <DashboardHeader onMenuClick={() => setIsMenuOpen(true)} />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
