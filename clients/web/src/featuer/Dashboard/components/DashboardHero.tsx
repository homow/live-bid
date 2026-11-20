import { Gavel } from "lucide-react";

import {
  SectionTitle,
  Lead,
  Small,
} from "@/Components/Ui/typography/typography";

import { Button } from "@/Components/Ui/button/button";

export default function DashboardHero() {
  return (
    <section className="relative isolate flex min-h-[180px] items-center overflow-hidden rounded-xl border border-[#4935A8] bg-gradient-to-r from-[#171044] via-[#21105C] to-[#080F27] p-5 sm:min-h-[210px] sm:p-7">
      <div className="relative z-10 max-w-[80%] sm:max-w-[60%]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#4935A8] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <Small className="text-white">Live Now</Small>
        </div>

        <SectionTitle className="mt-3 text-xl sm:text-2xl">
          Live Auction.
        </SectionTitle>

        <SectionTitle className="mt-1 text-lg text-[#8170FF] sm:text-xl">
          Real-Time Bidding.
        </SectionTitle>

        <Lead className="mt-2 text-xs leading-5 text-[#C3C9E5]">
          Discover rare items. Place your bid and win in real time.
        </Lead>

        <Button
          type="button"
          variant="default"
          size="lg"
          className="mt-4 border-[#4935A8] bg-[#4935A8] text-white hover:bg-[#6048D8] hover:text-white hover:shadow-none"
        >
          Browse Auction
        </Button>
      </div>
      {/* img Gavel */}
    </section>
  );
}
