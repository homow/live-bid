import Button from "@/Components/Ui/Button";
import LiveAuctionCard from "../LiveAuctionCard";

const Hero = () => {
  return (
    <section className="mx-auto flex min-h-[650px] w-full max-w-7xl items-center px-6 py-20  mt-8">
      <div className="grid w-full items-center gap-16 lg:grid-cols-2">

        <div className="max-w-2xl">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
              Live Auctions
            </span>
          </div>

          <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl">
            Bid.
            <span className="text-indigo-500"> Win.</span>
            <br />
            Own.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#a1a7b8]">
            Discover unique products, place your bid, and win amazing deals.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button>Explore Auctions</Button>
            <Button>Start Selling</Button>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Free to join · Start bidding today
          </p>
        </div>

   
        <LiveAuctionCard />
      </div>
    </section>
  );
};

export default Hero;
