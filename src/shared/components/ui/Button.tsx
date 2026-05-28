import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-garage-orange text-white hover:opacity-90",
  secondary: "border border-border bg-surface text-text-primary hover:bg-background",
  ghost: "bg-transparent text-text-primary hover:bg-background",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const { className, children, variant = "primary", size = "md", type = "button", ...rest } = props;
  return <button className={cn("inline-flex items-center justify-center rounded-full font-semibold transition", variantClass[variant], sizeClass[size], className)} type={type} {...rest}>{children}</button>;
}
