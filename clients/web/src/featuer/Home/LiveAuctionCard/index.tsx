const LiveAuctionCard = () => {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-[#1b202c] p-5 shadow-2xl shadow-black/20">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

            <span className="text-sm font-semibold text-red-400">LIVE</span>
          </div>

          <span className="text-xs text-slate-500">18 Bids</span>
        </div>

        <div className="flex h-64 items-center justify-center rounded-2xl bg-[#151923]"></div>

        <div className="mt-5">
          <h2 className="text-xl font-bold text-white">Apple Watch Series 9</h2>

          <p className="mt-1 text-sm text-slate-500">Electronics</p>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Current Bid</p>

            <p className="mt-1 text-3xl font-bold text-white">$420</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">Ends In</p>

            <p className="mt-1 font-mono text-sm font-semibold text-indigo-400">
              02:14:32
            </p>
          </div>
        </div>

        <button
          className="
            mt-6
            w-full
            rounded-xl
            bg-indigo-500
            py-3
            text-sm
            font-semibold
            text-white
            transition-all
            duration-300
            hover:bg-indigo-600
            hover:shadow-lg
            hover:shadow-indigo-500/20
            active:scale-[0.98]
          "
        >
          Place Bid
        </button>
      </div>
    </div>
  );
};

export default LiveAuctionCard;
