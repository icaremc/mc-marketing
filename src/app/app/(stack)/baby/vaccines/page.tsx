import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchChildVaccines, fetchVaccineSchedule } from "@/lib/api/children"

export default async function BabyVaccinesPage() {
  const [vaccines, schedule] = await Promise.all([
    fetchChildVaccines(),
    fetchVaccineSchedule(),
  ])
  return (
    <>
      <AppTopBar title="Vaccines" leading={<StackBackButton fallbackHref="/app/baby" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        <h2 className="text-sm font-semibold">Your records</h2>
        {vaccines.length === 0 ? (
          <EmptyState>No vaccine records yet.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {vaccines.map((row, i) => (
              <ListCard
                key={String(row.id ?? i)}
                title={String(row.vaccine_name ?? row.name ?? "Vaccine")}
                subtitle={String(row.status ?? "")}
                meta={
                  row.given_at
                    ? new Date(String(row.given_at)).toLocaleDateString()
                    : undefined
                }
              />
            ))}
          </div>
        )}
        {schedule.length > 0 ? (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Schedule</h2>
            <div className="flex flex-col gap-2">
              {schedule.slice(0, 20).map((row, i) => (
                <ListCard
                  key={String(row.id ?? i)}
                  title={String(
                    (row.translation && typeof row.translation === "object"
                      ? (row.translation as { title?: string }).title
                      : null) ||
                      row.name ||
                      row.vaccine_name ||
                      `Dose ${i + 1}`,
                  )}
                  subtitle={
                    row.age_weeks != null ? `At ${row.age_weeks} weeks` : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
