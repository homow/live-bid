import QuestionComponent from "./questionComponent";
import { H2, P } from "@/Components/Ui/typography/typography";
import { itemQuestions } from "@/mocks/item-question";

const Question = () => {
  return (
    <section
      className="
      mb-8
      w-full
      px-4
      transition-colors
      duration-300
      sm:px-6
      lg:px-8
    "
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <H2>Frequently Asked Questions (FAQ)</H2>
          <P>
            You can find answers to frequently asked questions about our
            services and how to use the features of our website in this section.
          </P>
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
