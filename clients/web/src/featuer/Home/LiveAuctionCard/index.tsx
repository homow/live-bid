import { Button } from "@/Components/Ui/button/button";
import { H2, Large, Small, Span } from "@/Components/Ui/typography/typography";

const LiveAuctionCard = () => {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-[#1b202c] p-5 shadow-2xl shadow-black/20">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <Span className="text-red-400">LIVE</Span>
          </div>
          <Small>18 Bids</Small>
        </div>

        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#151923]" />

        <div className="mt-5">
          <H2>Apple Watch Series 9</H2>
          <Small>Electronics</Small>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <Small>Current Bid</Small>
            <Large>$420</Large>
          </div>

          <div className="text-right">
            <Small>Ends In</Small>
            <Span className="font-mono text-indigo-400">02:14:32</Span>
          </div>
        </div>
        <Button className="mt-6 w-full">Place Bid</Button>
      </div>
    </div>
  );
};

export default LiveAuctionCard;
