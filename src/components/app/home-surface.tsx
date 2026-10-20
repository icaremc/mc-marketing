import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

function homeSurfaceClass(
  tone: "neutral" | "primary" | "warning" | "danger",
  bordered: boolean,
  className?: string,
) {
  const showBorder = bordered && tone !== "warning"
  return cn(
    "block rounded-xl p-4",
    tone === "warning" && "bg-[var(--icare-warning-card)]",
    tone === "danger" && "bg-[var(--icare-danger-card)]",
    (tone === "neutral" || tone === "primary") && "bg-card",
    showBorder &&
      "shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]",
    className,
  )
}

/** Flutter HomeSurfaceCard — radius 12, padding 16, warning wash, optional hairline. */
export function HomeSurfaceCard({
  href,
  tone = "neutral",
  bordered = true,
  children,
  className,
}: {
  href?: string
  tone?: "neutral" | "primary" | "warning" | "danger"
  bordered?: boolean
  children: React.ReactNode
  className?: string
}) {
  const cls = homeSurfaceClass(tone, bordered, className)
  if (!href) return <div className={cls}>{children}</div>
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}

/** Flutter _CardHeader + HomeIconBadge(size: 36, textPrimary @ 8%). */
export function HomeCardHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-foreground/[0.08] text-foreground">
        <Icon className="size-[17px]" strokeWidth={1.9} />
      </span>
      <p className="min-w-0 flex-1 text-sm font-bold leading-tight text-foreground">
        {title}
      </p>
      <ChevronRight
        className="size-5 shrink-0 text-foreground/70"
        strokeWidth={2}
      />
    </div>
  )
}

/** Flutter _MetricRow status chip — solid amber read like the mobile screenshot. */
export function HomeStatusChip({
  label,
  concern,
}: {
  label: string
  concern: boolean
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-lg px-2.5 py-[5px] text-[12px] font-bold leading-none",
        concern
          ? "bg-[#E0A82E] text-[#1E2D32]"
          : "border border-primary/25 bg-primary/15 text-[var(--icare-primary-dark)] dark:border-primary/30 dark:bg-primary/20 dark:text-primary",
      )}
    >
      {label}
    </span>
  )
}

/** Flutter _MetricRow */
export function HomeMetricRow({
  label,
  value,
  statusLabel,
  concern,
}: {
  label: string
  value: string
  statusLabel: string
  concern: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-none text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">
          {value}
        </p>
      </div>
      <HomeStatusChip label={statusLabel} concern={concern} />
    </div>
  )
}

/** Flutter advice inset — HomeStyle.iconBackground(warning). */
export function HomeAdviceBox({
  title = "Advice for you",
  items,
}: {
  title?: string
  items: { metricLabel: string; text: string }[]
}) {
  return (
    <div className="mt-3 rounded-[10px] bg-[var(--icare-warning-inset)] p-3">
      <p className="text-[13px] font-bold leading-none text-[#E08A00]">
        {title}
      </p>
      {items.map((item) => (
        <div key={item.metricLabel} className="mt-2">
          <p className="text-[12px] font-bold leading-none text-[#E08A00]">
            {item.metricLabel}
          </p>
          <p className="mt-0.5 text-xs leading-[1.4] text-muted-foreground">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  )
}

/** Flutter _MilestoneBullet */
export function HomeMilestoneBullet({ text }: { text: string }) {
  return (
    <div className="flex gap-0 pl-3.5 text-xs leading-[1.35] text-muted-foreground">
      <span className="w-3.5 shrink-0">·</span>
      <span className="min-w-0">{text}</span>
    </div>
  )
}

export function HomeSectionHeader({
  title,
  action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {action}
    </div>
  )
}
