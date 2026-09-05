"use client";

import Link from "next/link";
import { BadgeDollarSign, ArrowRight } from "lucide-react";

import { FaGithub } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-[#11151d] text-[#a1a7b8]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <BadgeDollarSign size={26} />

              <span className="h-5 w-px bg-slate-700" />
              <p className=" font-medium text-indigo-400">Live Bid</p>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#a1a7b8]">
              Join live auctions, discover unique products, and compete to win.
            </p>

            <p className="mt-4 text-sm font-semibold text-indigo-400">
              Bid. Win. Own.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://github.com/mardi-niyayesh"
                target="_blank"
                className="
      group
      flex
      w-fit
      items-center
      gap-3
      rounded-xl
      border
      border-slate-700/60
      px-3
      py-2
      text-sm
      text-slate-400
      transition-all
      duration-300
      hover:border-indigo-500/60
      active:border-indigo-500/60
      hover:bg-indigo-500/10
      active:bg-indigo-500/10
      hover:text-white
      active:text-white
    "
              >
                <span
                  className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        bg-slate-800
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-indigo-500
        group-hover:text-white
      "
                >
                  <FaGithub size={18} />
                </span>

                <span className="font-medium">Niyayesh Mardi</span>
              </a>

              <a
                href="https://github.com/homow"
                target="_blank"
                className="
      group
      flex
      w-fit
      items-center
      gap-3
      rounded-xl
      border
      border-slate-700/60
      px-3
      py-2
      text-sm
      text-slate-400
      transition-all
      duration-300
      hover:border-indigo-500/60
      active:border-indigo-500/60
      hover:bg-indigo-500/10
      active:bg-indigo-500/10
      hover:text-white
      active:text-white
    "
              >
                <span
                  className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        bg-slate-800
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-indigo-500
        group-hover:text-white
      "
                >
                  <FaGithub size={18} />
                </span>

                <span className="font-medium">Homayoun Sharifi</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-indigo-400"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/auctions"
                  className="transition-colors hover:text-indigo-400"
                >
                  Auctions
                </Link>
              </li>

              <li>
                <Link
                  href="/How-to-Work"
                  className="transition-colors hover:text-indigo-400"
                >
                  How It Works
                </Link>
              </li>
            </ul>
            <div className="mt-8">
              <p className="text-sm font-semibold text-white">
                Ready to start bidding?
              </p>

              <Link
                href="/auctions"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 transition-all duration-300 hover:gap-3 hover:text-indigo-300"
              >
                Explore Auctions
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div></div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LiveBid. All rights reserved.</p>

          <p className="text-slate-500">Made to niyayesh and Homayoun .</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
