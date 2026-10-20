import Link from "next/link"
import type { ReactNode } from "react"

export function ListCard({
  href,
  title,
  subtitle,
  meta,
  trailing,
}: {
  href?: string
  title: string
  subtitle?: string
  meta?: string
  trailing?: ReactNode
}) {
  const inner = (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta ? (
          <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>
        ) : null}
      </div>
      {trailing}
    </div>
  )
  if (!href) return inner
  return (
    <Link href={href} className="block transition hover:opacity-90">
      {inner}
    </Link>
  )
}
