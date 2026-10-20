import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import {
  fetchActivePregnancy,
  fetchPregnancyWeeks,
} from "@/lib/api/pregnancy"

export default async function PregnancyTabPage() {
  const [pregnancy, weeks] = await Promise.all([
    fetchActivePregnancy(),
    fetchPregnancyWeeks(),
  ])

  const currentWeek = pregnancy?.weekNumber ?? 0
  const weekContent =
    weeks.find((w) => w.weekNumber === currentWeek) ??
    weeks.find((w) => w.weekNumber === Math.max(1, currentWeek))

  return (
    <>
      <AppTopBar title="Pregnancy" />
      <div className="flex flex-col pb-6">
        {!pregnancy ? (
          <div className="px-5 pt-4">
            <EmptyState>
              Complete setup to see your pregnancy week.
            </EmptyState>
            <Link
              href="/app/onboarding"
              className="mt-4 flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
            >
              Complete setup
            </Link>
          </div>
        ) : (
          <>
            <Link
              href={`/app/pregnancy/week/${currentWeek}`}
              className="relative mx-5 mt-3 block h-[220px] overflow-hidden rounded-[10px] border border-primary/25"
            >
              <div className="absolute inset-0 bg-[var(--icare-surface-muted)]" />
              {weekContent?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={weekContent.imageUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-xs font-semibold text-white/85">
                  Week {currentWeek}
                </p>
                <p className="mt-1 text-lg font-extrabold text-white">
                  {weekContent?.title || `Pregnancy week ${currentWeek}`}
                </p>
              </div>
            </Link>

            <div className="mt-4 rounded-t-[28px] bg-card px-5 pb-8 pt-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
              {weekContent?.summary ? (
                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-sm font-bold">This week</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {weekContent.summary}
                  </p>
                </div>
              ) : null}

              <Link
                href="/app/health"
                className="mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3.5"
              >
                <div>
                  <p className="text-sm font-bold">Health tracker</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Log weight, BP & symptoms for week {currentWeek}
                  </p>
                </div>
                <ChevronRight className="size-5 text-primary" />
              </Link>

              <p className="mb-2.5 mt-8 text-base font-bold">Weekly guide</p>
              <div className="flex flex-col gap-2">
                {weeks.slice(0, 12).map((week) => (
                  <Link
                    key={week.id}
                    href={`/app/pregnancy/week/${week.weekNumber}`}
                    className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        Week {week.weekNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {week.title}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
