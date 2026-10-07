"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BadgeDollarSign, Menu, X } from "lucide-react";

import { Button } from "@/Components/Ui/button/button";

import { Separator } from "@/Components/Ui/separator";
import { Span } from "@/Components/Ui/typography/typography";

import { navigationItems } from "./navigation";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onAuthOpen: () => void;
};

const MobileMenu = ({
  isOpen,
  onClose,
  onOpen,
  onAuthOpen,
}: MobileMenuProps) => {
  return (
    <>
      <Button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={onOpen}
        className="md:hidden"
      >
        <Menu size={22} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed right-0 top-0 z-50 flex h-full w-[80%] max-w-sm flex-col border-l border-slate-800 bg-[#11151d] px-6 py-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BadgeDollarSign size={24} className="text-indigo-400" />

                  <Span>Live Bid</Span>
                </div>

                <Button
                  type="button"
                  aria-label="Close menu"
                  onClick={onClose}
                  variant="destructive"
                >
                  <X size={21} />
                </Button>
              </div>

              <Separator className="mt-6 bg-slate-800" />

              <nav className="mt-8">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                        >
                          <Icon size={19} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto border-t border-slate-800 pt-6">
                <Button type="button" onClick={onAuthOpen} className="w-full">
                  Sign In
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileMenu;
