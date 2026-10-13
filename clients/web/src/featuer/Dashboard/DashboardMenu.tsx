"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";

import { Separator } from "@/Components/Ui/separator";
import { DashboardSlidbar } from "./DashboardSlidbar";
import { Button } from "@/Components/Ui/button/button";
import HeaderLogo from "@/Components/layout/Header/HeaderLogo";

const DashboardMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        aria-label="Open dashboard menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        variant="outline"
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
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
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
              className="fixed right-0 top-0 z-50 flex h-full w-2/3 flex-col border-l border-slate-800 bg-[#11151d] px-6 py-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <HeaderLogo />

                <Button
                  type="button"
                  aria-label="Close dashboard menu"
                  onClick={() => setIsOpen(false)}
                  variant="destructive"
                >
                  <X size={21} />
                </Button>
              </div>

              <Separator className="mt-6 bg-slate-800" />

              <nav className="mt-8">
                <ul className="space-y-2">
                  {DashboardSlidbar.map((item) => {
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                        >
                          <Icon size={19} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto">
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  <LogOut size={19} />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardMenu;
