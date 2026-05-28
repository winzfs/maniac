import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes } from "react";

type CardVariant = "default" | "muted" | "dark";

const variantClass: Record<CardVariant, string> = {
  default: "border-border bg-surface text-text-primary",
  muted: "border-border bg-background text-text-primary",
  dark: "border-graphite bg-graphite text-white",
};

export function Card({ className, variant = "default", ...props }: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return <div className={cn("rounded-card border p-4", variantClass[variant], className)} {...props} />;
}
