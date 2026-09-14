import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/Ui/card/card";

import { H2, H4, P, Span } from "@/Components/Ui/typography/typography";

import { buyerSteps, sellerSteps } from "@/mocks/how-it-works";

const Moredetail = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-6">
      <div className="mx-auto max-w-2xl text-center">
        <H2>How It Works</H2>

        <P>Whether you want to buy or sell, getting started is simple.</P>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <HowItWorksCard
          title="For Buyers"
          description="Find products, place your bids, and win auctions."
          steps={buyerSteps}
        />

        <HowItWorksCard
          title="For Sellers"
          description="Create an auction and let buyers compete for your product."
          steps={sellerSteps}
        />
      </div>
    </section>
  );
};

type HowItWorksCardProps = {
  title: string;
  description: string;
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
};

const HowItWorksCard = ({ title, description, steps }: HowItWorksCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-4">
            <Span>{step.number}</Span>
            <div>
              <H4>{step.title}</H4>
              <P>{step.description}</P>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Moredetail;
