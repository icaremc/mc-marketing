import Link from "next/link"
import { Plus } from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import {
  HomeAdviceBox,
  HomeMetricRow,
  HomeSurfaceCard,
} from "@/components/app/home-surface"
import { fetchChildMeasurements, fetchChildren } from "@/lib/api/children"
import { buildHomeBabyHealth } from "@/lib/api/home-baby"

export default async function GrowthTabPage() {
  const [children, measurements, baby] = await Promise.all([
    fetchChildren(),
    fetchChildMeasurements(),
    buildHomeBabyHealth(),
  ])
  const active = children.find((c) => c.isActive) ?? children[0]

  return (
    <>
      <AppTopBar title="Growth" />
      <div className="flex flex-col gap-4 px-5 pb-6 pt-3">
        {active ? (
          <p className="text-sm text-muted-foreground">
            Tracking {active.name} ({active.ageLabel})
          </p>
        ) : null}

        {baby && (baby.weight || baby.height) ? (
          <HomeSurfaceCard
            tone={baby.needsAttention ? "warning" : "primary"}
            bordered={false}
          >
            <div className="flex flex-col gap-2.5">
              {baby.weight && baby.weightLabel ? (
                <HomeMetricRow
                  label="Weight"
                  value={baby.weightLabel}
                  statusLabel={baby.weight.label}
                  concern={baby.weight.isConcern}
                />
              ) : null}
              {baby.height && baby.heightLabel ? (
                <HomeMetricRow
                  label="Height"
                  value={baby.heightLabel}
                  statusLabel={baby.height.label}
                  concern={baby.height.isConcern}
                />
              ) : null}
              {baby.advice.length > 0 ? (
                <HomeAdviceBox items={baby.advice} />
              ) : !baby.needsAttention ? (
                <p className="mt-1 text-xs font-semibold leading-[1.35] text-[var(--icare-primary-dark)] dark:text-primary">
                  Weight and height look appropriate for age. Keep up regular
                  checkups.
                </p>
              ) : null}
            </div>
          </HomeSurfaceCard>
        ) : null}

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Measurements</h2>
          <Link
            href="/app/settings/baby"
            className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[13px] font-bold text-primary-foreground"
          >
            <Plus className="size-3.5" />
            Add
          </Link>
        </div>

        {measurements.length === 0 ? (
          <EmptyState>No measurements logged yet.</EmptyState>
        ) : (
          <div className="overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            {measurements.slice(0, 20).map((row, i, arr) => {
              const weight =
                row.weight_kg != null ? `${Number(row.weight_kg).toFixed(1)} kg` : null
              const height =
                row.height_cm != null ? `${Number(row.height_cm).toFixed(1)} cm` : null
              const when = row.measured_at
                ? new Date(String(row.measured_at)).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
              return (
                <div key={String(row.id ?? i)}>
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-sm font-bold">
                        {[weight, height].filter(Boolean).join(" · ") ||
                          "Measurement"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {when}
                      </p>
                    </div>
                  </div>
                  {i < arr.length - 1 ? (
                    <div className="mx-4 h-px bg-border" />
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
