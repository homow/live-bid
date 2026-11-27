import { Gavel, Users, DollarSign, Clock3 } from "lucide-react";

import { CardTitle, Small } from "@/Components/Ui/typography/typography";

const stats = [
  {
    title: "Active Auctions",
    value: "24",
    icon: Gavel,
    color: "text-[#8170FF]",
  },
  {
    title: "Total Bidders",
    value: "8.4k",
    icon: Users,
    color: "text-purple-400",
  },
  {
    title: "Total Sales",
    value: "1.2M",
    icon: DollarSign,
    color: "text-violet-400",
  },
  {
    title: "Live Auction",
    value: "2h 15m",
    icon: Clock3,
    color: "text-blue-400",
  },
];

export default function DashboardStats() {
  return (
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(({ title, value, icon: Icon, color }) => (
        <article
          key={title}
          className="min-w-0 rounded-xl border border-[#202D59] bg-[#101A35] p-3 sm:p-4"
        >
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />

            <CardTitle className="truncate text-base sm:text-lg">
              {value}
            </CardTitle>
          </div>

          <Small className="mt-2 block truncate text-[10px] sm:text-xs">
            {title}
          </Small>
        </article>
      ))}
    </section>
  );
}
