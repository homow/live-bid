const Moredetail = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 ">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          How It Works
        </h2>

        <p className="mt-4 text-base leading-7 text-[#a1a7b8]">
          Whether you want to buy or sell, getting started is simple.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-700/60 bg-[#1b202c] p-8">
          <div className="mb-8">
            <h3 className="mt-4 text-2xl font-bold text-white">For Buyers</h3>

            <p className="mt-2 text-sm text-[#a1a7b8]">
              Find products, place your bids, and win auctions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">01</span>

              <div>
                <h4 className="font-semibold text-white">Create an Account</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Sign up for free and start bidding.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">02</span>

              <div>
                <h4 className="font-semibold text-white">Find an Auction</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Browse live auctions and find something you love.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">03</span>

              <div>
                <h4 className="font-semibold text-white">Place Your Bid</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Compete with other buyers in real time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">04</span>

              <div>
                <h4 className="font-semibold text-white">Win the Auction</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  The highest bidder wins when the auction ends.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/60 bg-[#1b202c] p-8">
          <div className="mb-8">
            <h3 className="mt-4 text-2xl font-bold text-white">For Sellers</h3>

            <p className="mt-2 text-sm text-[#a1a7b8]">
              Create an auction and let buyers compete for your product.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">01</span>

              <div>
                <h4 className="font-semibold text-white">Create an Account</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Sign up and get ready to sell.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">02</span>

              <div>
                <h4 className="font-semibold text-white">Create an Auction</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Add your product, price, images, and duration.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">03</span>

              <div>
                <h4 className="font-semibold text-white">Receive Bids</h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  Buyers compete by placing their bids.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-400">04</span>

              <div>
                <h4 className="font-semibold text-white">
                  Sell to the Highest Bidder
                </h4>

                <p className="mt-1 text-sm text-[#a1a7b8]">
                  The highest bidder wins when the auction ends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Moredetail;
