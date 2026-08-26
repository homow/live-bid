import QuestionComponent from "./questionComponent";

const itemQuestions = [
  {
    id: 1,
    title: `Do I need an account to place a bid? `,
    text: `Yes. You need to create an account and sign in before you can place a bid on an auction.`,
  },
  {
    id: 2,
    title: `How is the winner selected?`,
    text: `The winner is the bidder with the highest valid bid when the auction timer reaches zero.`,
  },
  {
    id: 3,
    title: `Can I cancel my bid?`,
    text: `No. Once a bid has been submitted, it cannot be cancelled. Please make sure your bid is correct before submitting it.`,
  },
  {
    id: 4,
    title: `How do I create an auction?`,
    text: `Sign in to your account, choose Create Auction, add your product details and images, set the starting price and auction duration, then publish your auction.`,
  },
  {
    id: 5,
    title: `What happens when an auction ends?`,
    text: `When the timer reaches zero, the auction closes and no new bids can be placed. The bidder with the highest valid bid is declared the winner.`,
  },
];

const Question = () => {
  return (
    <section
      className="
      mb-8
      w-full
      bg-[var(--background)]
      px-4
      transition-colors
      duration-300
      sm:px-6
      lg:px-8
    "
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2
            className="
            mx-auto
            mt-2
            flex
            w-fit
            items-center
            gap-2
        
            pr-4
            text-center
            text-2xl
            font-black
            text-[var(--foreground)]
            transition-colors
            duration-300
            sm:text-3xl
            lg:text-4xl
            mb-2
          "
          >
            Frequently Asked Questions (FAQ)
          </h2>

          <p
            className="
            mx-auto
            mt-3
            max-w-2xl
            text-sm
            leading-7
            text-[var(--muted-foreground)]
            transition-colors
            duration-300
            sm:text-base
          "
          >
            You can find answers to frequently asked questions about our
            services and how to use the features of our website in this section.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {itemQuestions.map((item) => (
            <QuestionComponent
              key={item.id}
              title={item.title}
              text={item.text}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Question;
