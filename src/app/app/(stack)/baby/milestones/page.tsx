import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchChildMilestones } from "@/lib/api/children"

export default async function BabyMilestonesPage() {
  const items = await fetchChildMilestones()
  return (
    <>
      <AppTopBar title="Milestones" leading={<StackBackButton fallbackHref="/app/baby" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {items.length === 0 ? (
          <EmptyState>No milestones logged yet.</EmptyState>
        ) : (
          items.map((row, i) => (
            <ListCard
              key={String(row.id ?? i)}
              title={String(row.title ?? row.name ?? row.milestone ?? "Milestone")}
              subtitle={String(row.notes ?? row.description ?? "")}
              meta={
                row.achieved_at
                  ? new Date(String(row.achieved_at)).toLocaleDateString()
                  : undefined
              }
            />
          ))
        )}
      </div>
    </>
  )
}
