"use client";

import { ThemeToggle } from "@/components/motion/theme-toggle";

export function ModeToggle() {
  return (
    <ThemeToggle
      variant="circle-blur"
      className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border-none"
      iconClassName="w-5 h-5"
    />
  );
}
