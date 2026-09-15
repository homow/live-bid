"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/Components/Ui/button/button";
import { H4, P } from "@/Components/Ui/typography/typography";

type QuestionComponentProps = {
  title: string;
  text?: string;
};

const QuestionComponent = ({ title, text }: QuestionComponentProps) => {
  const [showFullText, setShowFullText] = useState(false);

  const toggleAnswer = () => {
    if (!text) return;

    setShowFullText((prev) => !prev);
  };

  return (
    <div className="w-full px-1 py-1 sm:px-2 sm:py-2">
      <div
        className={`overflow-hidden rounded-2xl border bg-[#1b202c] transition-all duration-300 sm:rounded-3xl ${
          showFullText ? "border-indigo-500/60" : "border-slate-700/60"
        }`}
      >
        <Button
          type="button"
          onClick={toggleAnswer}
          disabled={!text}
          className={`group flex h-auto min-h-14 w-full items-center justify-between gap-3 px-4 py-4 text-left transition-all duration-300 sm:min-h-16 sm:gap-4 sm:px-5 sm:py-5 lg:px-6 ${
            showFullText ? "bg-[#222838]" : "bg-[#1b202c] hover:bg-[#222838]"
          }`}
        >
          <H4
            className={`min-w-0 flex-1 whitespace-normal break-words text-left leading-6 sm:leading-7 ${
              showFullText ? "text-indigo-400" : "text-slate-200"
            }`}
          >
            {title}
          </H4>

          {text && (
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-9 sm:w-9 md:h-10 md:w-10 ${
                showFullText
                  ? "rotate-45 border-indigo-500 bg-indigo-500 text-white"
                  : "border-slate-700 bg-[#222838] text-indigo-400 group-hover:text-white"
              }`}
            >
              <Plus size={17} strokeWidth={2} className="sm:size-[19px]" />
            </span>
          )}
        </Button>

        <div
          className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            showFullText
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            {text && (
              <div className="border-t border-slate-700/60 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
                <P>{text}</P>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default QuestionComponent;
