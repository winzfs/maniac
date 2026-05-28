import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-garage-orange text-white hover:opacity-90",
  secondary: "bg-surface text-graphite border border-border hover:bg-zinc-50",
  ghost: "bg-transparent text-graphite hover:bg-zinc-100",
};
const sizeClasses: Record<Size, string> = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-base" };

export function Button({ className, children, type = "button", variant = "primary", size = "md", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={cn("inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garage-orange disabled:opacity-50", variantClasses[variant], sizeClasses[size], className)} {...props}>{children}</button>;
}
