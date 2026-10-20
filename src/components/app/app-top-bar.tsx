import Image from "next/image"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Flutter AppBar — light: white + dark text; dark: chrome + white text. */
export function AppTopBar({
  title,
  leading,
  actions,
  className,
  brand,
}: {
  title: ReactNode
  leading?: ReactNode
  actions?: ReactNode
  className?: string
  brand?: boolean
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-[var(--icare-header-bg)] px-4 pt-[env(safe-area-inset-top,0px)] text-[var(--icare-header-fg)]",
        className,
      )}
    >
      {leading ? (
        <div className="flex w-10 shrink-0 items-center justify-start">{leading}</div>
      ) : null}
      <div className="min-w-0 flex-1 truncate">
        {brand ? (
          <div className="flex items-center gap-2">
            <Image
              src="/icare-logo.png"
              alt=""
              width={40}
              height={40}
              className="size-10 object-contain"
              priority
            />
            <span className="text-base font-bold tracking-tight text-[var(--icare-brand)]">
              ICare MC
            </span>
          </div>
        ) : (
          <span className="text-base font-semibold tracking-tight">
            {title}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-0.5 text-[var(--icare-header-fg)]">
        {actions}
      </div>
    </header>
  )
}
