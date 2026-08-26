"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeDollarSign,
  Menu,
  X,
  Home,
  Gavel,
  Trophy,
  CircleHelp,
} from "lucide-react";

import Button from "@/Components/Ui/Button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BadgeDollarSign size={26} className="text-indigo-400" />

          <span className="h-5 w-px bg-slate-700" />

          <p className="text-sm font-medium text-indigo-400">Live Bid</p>
        </div>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium">
            <li>
              <Link
                href="/"
                className="transition-colors duration-300 hover:text-indigo-400"
              >
                Home
              </Link>
            </li>

            <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
              Auctions
            </li>

            <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
              Winners
            </li>

            <li className="cursor-pointer transition-colors duration-300 hover:text-indigo-400">
              How It Works?
            </li>
          </ul>
        </nav>

        <div className="hidden md:block">
          <Button>Sign In</Button>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setIsMenuOpen(true)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-700
            bg-white/5
            text-slate-300
            transition-all
            duration-300
            hover:border-indigo-500
            hover:bg-indigo-500/10
            hover:text-indigo-400
            md:hidden
          "
        >
          <Menu size={22} />
        </button>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMenu}
              className="
                fixed
                inset-0
                z-40
                bg-black/60
                backdrop-blur-sm
                md:hidden
              "
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
              className="
                fixed
                right-0
                top-0
                z-50
                flex
                h-full
                w-[80%]
                max-w-sm
                flex-col
                border-l
                border-slate-800
                bg-[#11151d]
                px-6
                py-6
                shadow-2xl
                md:hidden
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BadgeDollarSign size={24} className="text-indigo-400" />

                  <span className="text-sm font-semibold text-white">
                    Live Bid
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={closeMenu}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-700
                    text-slate-400
                    transition-all
                    duration-300
                    hover:border-red-500/50
                    hover:bg-red-500/10
                    hover:text-red-400
                  "
                >
                  <X size={21} />
                </button>
              </div>

              <nav className="mt-12">
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/"
                      className="transition-colors duration-300 hover:text-indigo-400"
                    >
                      <button
                        onClick={closeMenu}
                        className="
                        flex
                        w-full
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3.5
                        text-left
                        text-sm
                        font-medium
                        text-slate-300
                        transition-all
                        duration-300
                        hover:bg-indigo-500/10
                        hover:text-indigo-400
                      "
                      >
                        <Home size={19} />
                        Home
                      </button>
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={closeMenu}
                      className="
                        flex
                        w-full
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3.5
                        text-left
                        text-sm
                        font-medium
                        text-slate-300
                        transition-all
                        duration-300
                        hover:bg-indigo-500/10
                        hover:text-indigo-400
                      "
                    >
                      <Gavel size={19} />
                      Auctions
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={closeMenu}
                      className="
                        flex
                        w-full
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3.5
                        text-left
                        text-sm
                        font-medium
                        text-slate-300
                        transition-all
                        duration-300
                        hover:bg-indigo-500/10
                        hover:text-indigo-400
                      "
                    >
                      <Trophy size={19} />
                      Winners
                    </button>
                  </li>

                  <li>
                    <Link
                      href="/How-to-Work"
                      className="transition-colors duration-300 hover:text-indigo-400"
                    >
                      <button
                        onClick={closeMenu}
                        className="
                        flex
                        w-full
                        items-center
                        gap-4
                        rounded-xl
                        px-4
                        py-3.5
                        text-left
                        text-sm
                        font-medium
                        text-slate-300
                        transition-all
                        duration-300
                        hover:bg-indigo-500/10
                        hover:text-indigo-400
                      "
                      >
                        <CircleHelp size={19} />
                        How It Works
                      </button>
                    </Link>
                  </li>
                </ul>
              </nav>
              <div className="mt-auto border-t border-slate-800 pt-6">
                <Button>Sign In</Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
