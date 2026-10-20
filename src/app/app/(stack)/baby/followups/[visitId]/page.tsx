import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchChildFollowups } from "@/lib/api/children"

export default async function FollowupDetailPage({
  params,
}: {
  params: Promise<{ visitId: string }>
}) {
  const { visitId } = await params
  const items = await fetchChildFollowups()
  const item = items.find((row) => String(row.id) === visitId) ?? items[0]

  return (
    <>
      <AppTopBar
        title="Visit"
        leading={<StackBackButton fallbackHref="/app/baby/followups" />}
      />
      <div className="flex flex-col gap-3 px-4 py-5">
        {!item ? (
          <p className="text-sm text-muted-foreground">Visit not found.</p>
        ) : (
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-sm font-semibold">
              {String(item.title ?? item.visit_type ?? "Follow-up")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {String(item.notes ?? item.description ?? "No notes.")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {item.visit_date || item.scheduled_at
                ? new Date(
                    String(item.visit_date ?? item.scheduled_at),
                  ).toLocaleString()
                : ""}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
