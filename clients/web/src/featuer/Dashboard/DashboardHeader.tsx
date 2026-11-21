"use client";

import { useState } from "react";
import { Menu, Search } from "lucide-react";

import { Input } from "@/Components/Ui/input";
import { Button } from "@/Components/Ui/button/button";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="shrink-0 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex h-10 w-full max-w-[500px] items-center gap-3 rounded-xl border border-border bg-muted px-3 sm:h-11 sm:px-4">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />

        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search auction or items ..."
          className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
      </div>
    </header>
  );
}
