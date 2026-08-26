import Moredetail from "./Moredetail";
import Question from "../question";

const LearnMore = () => {
  return (
    <main className="min-h-screen bg-[#151923] mt-10">
      <Moredetail />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Auction Rules
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#a1a7b8] sm:text-base">
            Please review the rules before participating in an auction.
          </p>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/60 bg-[#1b202c] p-5 sm:p-6">
            <span className="text-sm font-bold text-indigo-400">01</span>

            <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">
              Higher Bids
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#a1a7b8]">
              Each bid must be higher than the current highest bid.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-[#1b202c] p-5 sm:p-6">
            <span className="text-sm font-bold text-indigo-400">02</span>

            <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">
              No Bid Cancellation
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#a1a7b8]">
              Bids cannot be cancelled once submitted.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-[#1b202c] p-5 sm:p-6">
            <span className="text-sm font-bold text-indigo-400">03</span>

            <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">
              Highest Bidder Wins
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#a1a7b8]">
              The highest bidder when the auction ends wins.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-[#1b202c] p-5 sm:p-6">
            <span className="text-sm font-bold text-indigo-400">04</span>

            <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">
              Auction Closing
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#a1a7b8]">
              Once an auction ends, no new bids can be placed.
            </p>
          </div>
        </div>
      </section>

      <Question />
    </main>
  );
};

export default LearnMore;
