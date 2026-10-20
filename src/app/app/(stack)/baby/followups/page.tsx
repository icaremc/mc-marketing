import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchChildFollowups } from "@/lib/api/children"

export default async function BabyFollowupsPage() {
  const items = await fetchChildFollowups()
  return (
    <>
      <AppTopBar title="Follow-ups" leading={<StackBackButton fallbackHref="/app/baby" />} />
      <div className="flex flex-col gap-2 px-4 py-4">
        {items.length === 0 ? (
          <EmptyState>No follow-up visits yet.</EmptyState>
        ) : (
          items.map((row, i) => (
            <ListCard
              key={String(row.id ?? i)}
              href={`/app/baby/followups/${row.id ?? i}`}
              title={String(row.title ?? row.visit_type ?? "Visit")}
              subtitle={String(row.notes ?? row.status ?? "")}
              meta={
                row.visit_date || row.scheduled_at
                  ? new Date(
                      String(row.visit_date ?? row.scheduled_at),
                    ).toLocaleDateString()
                  : undefined
              }
            />
          ))
        )}
      </div>
    </>
  )
}
