"use client";

import { useState } from "react";

import HeaderLogo from "./HeaderLogo";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import AuthModal from "@/featuer/Auth/Component/AuthModal";
import { Button } from "@/Components/Ui/button/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openAuth = () => {
    setIsMenuOpen(false);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-800/60 bg-[#151923] md:bg-[#151923]/90 md:backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <HeaderLogo />

          <DesktopNav />

          <div className="hidden md:block">
            <Button type="button" onClick={openAuth} className="...">
              Sign In
            </Button>
          </div>

          <MobileMenu
            isOpen={isMenuOpen}
            onOpen={openMenu}
            onClose={closeMenu}
            onAuthOpen={openAuth}
          />
        </div>
      </header>

      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
};

export default Header;
