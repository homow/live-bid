import { Heart, Smartphone, Laptop } from "lucide-react";

import {
  SectionTitle,
  CardTitle,
  Small,
  Muted,
} from "@/Components/Ui/typography/typography";

import { Button } from "@/Components/Ui/button/button";

const auctions = [
  {
    id: 1,
    title: "Digital phone",
    price: "$18,500",
    time: "00:12:45",
    icon: Smartphone,
  },
  {
    id: 2,
    title: "Premium laptop",
    price: "$12,800",
    time: "00:08:20",
    icon: Laptop,
  },
];

export default function LiveAuctions() {
  return (
    <section className="min-w-0 rounded-xl border border-[#202D59] bg-[#101A35] p-4">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle className="text-base">Live Auctions</SectionTitle>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border-0 text-xs text-[#8170FF] hover:bg-transparent hover:text-white"
        >
          View all
        </Button>
      </div>

      <div className="space-y-3">
        {auctions.map((auction) => {
          const Icon = auction.icon;

          return (
            <article
              key={auction.id}
              className="flex min-w-0 gap-3 rounded-lg bg-[#080F27] p-2 sm:p-3"
            >
              <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500/40 to-slate-950 sm:h-28 sm:w-24">
                <Icon className="h-10 w-10 text-slate-300" />
              </div>

              <div className="min-w-0 flex-1 py-1">
                <span className="inline-flex rounded bg-red-500 px-2 py-1">
                  <Small className="text-[9px] font-bold text-white">
                    LIVE
                  </Small>
                </span>

                <CardTitle className="mt-2 truncate text-sm">
                  {auction.title}
                </CardTitle>

                <Small className="mt-1 block font-bold text-amber-400">
                  {auction.time}
                </Small>

                <Muted className="mt-2 truncate">
                  Current bid: {auction.price}
                </Muted>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Add to watchlist"
                className="shrink-0 self-start border-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
