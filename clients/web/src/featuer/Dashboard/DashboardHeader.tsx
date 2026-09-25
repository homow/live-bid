"use client";

import { User } from "lucide-react";
import DashboardMenu from "./DashboardMenu";
import { Button } from "@/Components/Ui/button/button";

export default function DashboardHeader() {
  return (
<header className="sticky top-0 z-40 flex h-16 w-full items-center justify-end gap-3 border-b border-slate-800/70 bg-[#151923] px-6">
  <Button type="button" variant="outline">
    <User className="h-5 w-5" />
  </Button>

  <DashboardMenu />
</header>
  );
}
