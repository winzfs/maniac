import { cn } from "@/shared/lib/cn";
import type { HTMLAttributes } from "react";

type CardVariant = "default" | "muted" | "dark";

const variantClass: Record<CardVariant, string> = {
  default: "border-border/90 bg-surface text-text-primary shadow-card",
  muted: "border-border/90 bg-background text-text-primary",
  dark: "border-graphite bg-graphite text-white shadow-card",
};

export function Card({ className, variant = "default", ...props }: HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return <div className={cn("rounded-card border p-3 sm:p-4", variantClass[variant], className)} {...props} />;
}
