import Link from "next/link"
import { ChevronRight, ListChecks, Scale, Syringe, Stethoscope } from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { buildHomeBabyHealth } from "@/lib/api/home-baby"
import { fetchChildren } from "@/lib/api/children"

const LINKS = [
  {
    href: "/app/baby/followups",
    label: "Follow-up visits",
    Icon: Stethoscope,
  },
  {
    href: "/app/baby/milestones",
    label: "Developmental milestones",
    Icon: ListChecks,
  },
  {
    href: "/app/baby/vaccines",
    label: "Vaccination",
    Icon: Syringe,
  },
  {
    href: "/app/growth",
    label: "Growth for age",
    Icon: Scale,
  },
] as const

export default async function BabyTabPage() {
  const [children, babyHealth] = await Promise.all([
    fetchChildren(),
    buildHomeBabyHealth(),
  ])
  const active = children.find((c) => c.isActive) ?? children[0]

  return (
    <>
      <AppTopBar title="Baby" />
      <div className="flex flex-col gap-4 px-5 pb-6 pt-3">
        {children.length === 0 ? (
          <EmptyState>
            No children yet. Add one from settings when you are ready.
          </EmptyState>
        ) : (
          <>
            {active ? (
              <div
                className="rounded-xl px-4 py-4"
                style={{
                  background:
                    "color-mix(in srgb, #FFE6C7 55%, var(--card))",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-lg font-bold text-primary">
                    {active.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={active.photoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      active.name.slice(0, 1)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-extrabold">
                      {active.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {active.ageLabel} · {active.gender}
                    </p>
                  </div>
                </div>
                <Link
                  href="/app/baby/milestones"
                  className="mt-3 inline-flex text-sm font-bold text-[#E08A00]"
                >
                  View developmental milestones →
                </Link>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              {LINKS.map((item, i) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                      <item.Icon className="size-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold">
                      {item.label}
                    </span>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                  {i < LINKS.length - 1 ? (
                    <div className="mx-4 h-px bg-border" />
                  ) : null}
                </div>
              ))}
            </div>

            {babyHealth?.vaccines.show ? (
              <Link
                href="/app/baby/vaccines"
                className="rounded-xl bg-[var(--icare-warning-card)] px-4 py-3.5"
              >
                <p className="text-sm font-bold text-[#E08A00]">
                  {babyHealth.vaccines.title}
                </p>
                {babyHealth.vaccines.names ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {babyHealth.vaccines.names}
                  </p>
                ) : null}
              </Link>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}
