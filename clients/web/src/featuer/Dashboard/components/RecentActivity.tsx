import { Gavel, Heart, Wallet } from "lucide-react";

const activities = [
  {
    title: "You placed a bid",
    time: "2 min ago",
    icon: Gavel,
    color: "text-[#8170FF]",
  },
  {
    title: "Added to Watchlist",
    time: "15 min ago",
    icon: Heart,
    color: "text-red-400",
  },
  {
    title: "Wallet topped up",
    time: "10 min ago",
    icon: Wallet,
    color: "text-blue-400",
  },
];

export default function RecentActivity() {
  return (
    <section className="min-w-0 rounded-xl border border-[#202D59] bg-[#101A35] p-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-white">Recent Activity</h2>

        <button
          type="button"
          className="text-xs text-[#8170FF] hover:text-white"
        >
          View all
        </button>
      </div>

      <div className="space-y-5">
        {activities.map(({ title, time, icon: Icon, color }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#080F27]">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-[#E4E8F5]">{title}</p>

              <p className="mt-1 text-xs text-[#8D96B3]">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
