import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-300 outline-none select-none active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 active:text-white",

        outline:
          "border-indigo-500/40 bg-transparent text-indigo-400 hover:bg-indigo-500/10 hover:text-white",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

        ghost:
          "border-transparent bg-transparent text-indigo-400 hover:bg-indigo-500/10 hover:text-white",

        destructive:
          "border-red-500/40 bg-red-500/10 text-red-400 hover:text-white hover:shadow-lg hover:shadow-red-500/20",

        link: "border-transparent bg-transparent p-0 text-indigo-400 hover:text-white hover:underline",
      },

      size: {
        default: "px-5 py-2.5",
        xs: "px-2.5 py-1.5 text-xs",
        sm: "px-3 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
