"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          success:
            "!border-green-500 !bg-green-500/10 !text-green-600 dark:!text-green-400",

          error:
            "!border-red-500 !bg-red-500/10 !text-red-600 dark:!text-red-400",

          warning:
            "!border-yellow-500 !bg-yellow-500/10 !text-yellow-600 dark:!text-yellow-400",

          info:
            "!border-blue-500 !bg-blue-500/10 !text-blue-600 dark:!text-blue-400",

          loading:
            "!border-slate-500 !bg-slate-500/10 !text-slate-600 dark:!text-slate-400",
        },
      }}
    />
  );
};

export { Toaster };