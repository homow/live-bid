"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Gavel,
  CalendarDays,
  Heart,
  Bell,
  Wallet,
  UserRound,
  LogOut,
  X,
} from "lucide-react";

import { CardTitle, Span, Small } from "@/Components/Ui/typography/typography";

import { Button } from "@/Components/Ui/button/button";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Auctions", href: "/auctions", icon: Gavel },
  { label: "My Bids", href: "/my-bids", icon: CalendarDays },
  { label: "Watch List", href: "/watch-list", icon: Heart },
  { label: "Notification", href: "/notifications", icon: Bell },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col
        border-r border-[#202D59] bg-[#0A122C] px-4 py-5
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <div className="mb-10 flex items-center justify-between px-2">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <Gavel className="h-9 w-9 shrink-0 text-[#182CFF]" />

          <div>
            <CardTitle className="text-2xl text-[#E4E8F5]">Live Bid</CardTitle>

            <Small className="mt-1 block text-center text-[10px] text-[#A1A7B8]">
              Bid.Win.Live
            </Small>
          </div>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close menu"
          className="border-0 text-[#A1A7B8] hover:bg-[#202A42] lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-3
                transition-colors
                ${
                  isActive
                    ? "bg-[#182CFF]/10 text-white"
                    : "text-[#A1A7B8] hover:bg-[#182CFF]/10 hover:text-white"
                }
              `}
            >
              <Icon className="h-5 w-5 shrink-0 text-[#AAB8F0]" />

              <Span
                className={
                  isActive ? "font-semibold text-white" : "text-[#A1A7B8]"
                }
              >
                {label}
              </Span>

              {label === "Notification" && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7046FF] px-1">
                  <Small className="text-[10px] text-white">3</Small>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        className="mt-auto w-full justify-center border-[#202D59] bg-transparent text-red-400 hover:bg-red-500/10"
      >
        <LogOut className="h-5 w-5" />
        <Span className=" text-red-400">Log out</Span>
      </Button>
    </aside>
  );
}
