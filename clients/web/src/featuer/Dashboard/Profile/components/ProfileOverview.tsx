import { Mail, AtSign, CalendarDays, ShieldCheck } from "lucide-react";

import { CardTitle, Span, Small } from "@/Components/Ui/typography/typography";

export default function ProfileOverview() {
  return (
    <section className="h-fit rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col items-center border-b border-border pb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
          N
        </div>

        <CardTitle className="mt-4">Niya-m</CardTitle>
      </div>

      <div className="space-y-5 pt-5">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Small className="break-all">niya@example.com</Small>
        </div>

        <div className="flex items-center gap-3">
          <AtSign className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Small>niya_auction</Small>
        </div>

        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <Small>Jan 12, 2024</Small>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
        <Span>Account Status</Span>

        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          Active
        </span>
      </div>
    </section>
  );
}
