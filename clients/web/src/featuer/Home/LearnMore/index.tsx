import Moredetail from "./Moredetail";
import Question from "../question";

import { Card, CardContent } from "@/Components/Ui/card/card";
import { H2, H4, P, Span } from "@/Components/Ui/typography/typography";

import { auctionRules } from "@/mocks/auction-rules";

const LearnMore = () => {
  return (
    <main className="mt-25 min-h-screen bg-[#151923]">
      <Moredetail />
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <H2>Auction Rules</H2>
          <P>Please review the rules before participating in an auction.</P>
        </div>
        <div className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2">
          {auctionRules.map((rule) => (
            <Card key={rule.number}>
              <CardContent className="pt-6">
                <Span>{rule.number}</Span>
                <H4>{rule.title}</H4>
                <P>{rule.description}</P>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <Question />
    </main>
  );
};

export default LearnMore;
