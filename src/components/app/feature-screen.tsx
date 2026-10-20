import Link from "next/link"
import type { ReactNode } from "react"

import { AppTopBar } from "@/components/app/app-top-bar"

export function FeatureScreen({
  title,
  eyebrow,
  summary,
  apis = [],
  links = [],
  leading,
  actions,
  children,
}: {
  title: string
  eyebrow?: string
  summary: string
  apis?: string[]
  links?: { href: string; label: string }[]
  leading?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <>
      <AppTopBar title={title} leading={leading} actions={actions} />
      <div className="flex flex-col gap-4 px-4 py-5">
        {eyebrow ? (
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        {apis.length > 0 ? (
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              API
            </p>
            <ul className="mt-2 space-y-1 font-mono text-[11px] text-foreground/80">
              {apis.map((api) => (
                <li key={api}>{api}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {links.length > 0 ? (
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary/40"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </>
  )
}
