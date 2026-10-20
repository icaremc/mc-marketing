import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Desktop: centered smartphone sandbox (max-w-md).
 * Mobile: full-bleed app chrome.
 * Mirrors Flutter Scaffold bounds for /app and /doctors/app.
 */
export function MobileFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="app-shell-stage h-dvh w-full overflow-hidden bg-[#d8dcdf] dark:bg-[#0B1F17] md:flex md:items-stretch md:justify-center">
      <div
        className={cn(
          "app-shell relative mx-auto flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden bg-background shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
