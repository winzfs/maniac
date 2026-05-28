import { cn } from "@/shared/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
export function Button({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn("rounded-full px-4 py-2 text-sm font-semibold", "bg-garage-orange text-white hover:opacity-90", className)} {...props}>{children}</button>;
}
