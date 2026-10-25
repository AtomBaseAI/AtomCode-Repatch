"use client"

import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

/**
 * App-wide theme switcher — Magic UI AnimatedThemeToggler (circular reveal via
 * the View Transitions API) driven in controlled mode by next-themes, so every
 * useTheme() subscriber (CodeMirror editor themes, toolbars, ...) stays in sync
 * and persistence stays owned by next-themes instead of raw localStorage.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={(theme) => setTheme(theme)}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent text-black shadow-none transition-colors hover:bg-transparent hover:text-primary dark:text-white",
        className
      )}
    />
  )
}
