import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TypographyProps = HTMLAttributes<HTMLElement>;

function H1({ children, className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight text-white sm:text-5xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

function H2({ children, className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-bold tracking-tight text-white sm:text-4xl",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function H4({ children, className, ...props }: TypographyProps) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-base font-semibold tracking-tight text-white",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

function P({ children, className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-sm leading-6 text-[#a1a7b8] sm:text-base", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function Lead({ children, className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-base leading-7 text-[#a1a7b8]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function Large({ children, className, ...props }: TypographyProps) {
  return (
    <div
      className={cn("text-lg font-semibold text-white", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function Small({ children, className, ...props }: TypographyProps) {
  return (
    <small
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    >
      {children}
    </small>
  );
}
function Label({ children, className, ...props }: TypographyProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-slate-300",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}

function Muted({ children, className, ...props }: TypographyProps) {
  return (
    <p className={cn("text-sm text-slate-400", className)} {...props}>
      {children}
    </p>
  );
}

function Span({ children, className, ...props }: TypographyProps) {
  return (
    <span className={cn("text-base", className)} {...props}>
      {children}
    </span>
  );
}

function List({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
      {children}
    </ul>
  );
}

function InputErrorMessage({ children, className, ...props }: TypographyProps) {
  if (!children) return null;

  return (
    <p
      className={cn("pt-1 ps-0.5 text-xs text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export {
  H1,
  H2,
  H3,
  H4,
  InputErrorMessage,
  Label,
  Large,
  Lead,
  List,
  Muted,
  P,
  Small,
  Span,
};