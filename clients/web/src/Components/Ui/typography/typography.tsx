import {
  ListItemTypograph,
  TypographyTs,
} from "@/Components/Ui/typography/typography";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// Page title
function PageTitle({ children, className, ...props }: TypographyTs) {
  return (
    <h1
      className={cn(
        "text-2xl font-bold tracking-tight text-white sm:text-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

function SectionTitle({ children, className, ...props }: TypographyTs) {
  return (
    <h2
      className={cn(
        "text-xl font-semibold tracking-tight text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function CardTitle({ children, className, ...props }: TypographyTs) {
  return (
    <h3
      className={cn("text-base font-semibold text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function H1({ children, className, ...props }: TypographyTs) {
  return (
    <h1
      className={cn("text-3xl font-bold tracking-tight text-white", className)}
      {...props}
    >
      {children}
    </h1>
  );
}

function H2({ children, className, ...props }: TypographyTs) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, className, ...props }: TypographyTs) {
  return (
    <h3
      className={cn("text-xl font-semibold text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function H4({ children, className, ...props }: TypographyTs) {
  return (
    <h4
      className={cn("text-lg font-semibold text-white", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

function P({ children, className, ...props }: TypographyTs) {
  return (
    <p className={cn("text-sm leading-6 text-[#A1A7B8]", className)} {...props}>
      {children}
    </p>
  );
}

function Span({ children, className, ...props }: TypographyTs) {
  return (
    <span className={cn("text-sm text-[#A1A7B8]", className)} {...props}>
      {children}
    </span>
  );
}

function Label({ children, className, ...props }: TypographyTs) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-[#C3C9E5]", className)}
      {...props}
    >
      {children}
    </label>
  );
}

function List({
  listItems,
  className,
  ...props
}: {
  listItems?: ListItemTypograph[] | string[];
} & HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "my-4 ml-5 list-disc space-y-2 text-sm text-[#A1A7B8]",
        className,
      )}
      {...props}
    >
      {listItems?.map((item, index) => (
        <li key={typeof item === "string" ? index : (item.id ?? index)}>
          {typeof item === "string" ? item : item.content}
        </li>
      ))}
    </ul>
  );
}

function Lead({ children, className, ...props }: TypographyTs) {
  return (
    <p
      className={cn("text-base leading-7 text-[#A1A7B8]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function Large({ children, className, ...props }: TypographyTs) {
  return (
    <div
      className={cn("text-lg font-semibold text-white", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function Small({ children, className, ...props }: TypographyTs) {
  return (
    <small
      className={cn("text-xs leading-5 text-[#77819E]", className)}
      {...props}
    >
      {children}
    </small>
  );
}

function Muted({ children, className, ...props }: TypographyTs) {
  return (
    <p className={cn("text-xs leading-5 text-[#77819E]", className)} {...props}>
      {children}
    </p>
  );
}

function InputErrorMessage({ children, className, ...props }: TypographyTs) {
  if (!children) return null;

  return (
    <p className={cn("pt-1 text-xs text-red-400", className)} {...props}>
      {children}
    </p>
  );
}

const InputErrorMassage = InputErrorMessage;

export {
  H1,
  H2,
  H3,
  H4,
  PageTitle,
  SectionTitle,
  CardTitle,
  Label,
  InputErrorMessage,
  InputErrorMassage,
  Large,
  Lead,
  List,
  Muted,
  P,
  Small,
  Span,
};
