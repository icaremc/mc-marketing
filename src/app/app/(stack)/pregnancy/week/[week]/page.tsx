import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPregnancyWeeks } from "@/lib/api/pregnancy"

export default async function PregnancyWeekPage({
  params,
}: {
  params: Promise<{ week: string }>
}) {
  const { week } = await params
  const weekNumber = Number(week) || 1
  const weeks = await fetchPregnancyWeeks()
  const content = weeks.find((w) => w.weekNumber === weekNumber)

  return (
    <>
      <AppTopBar
        title={`Week ${weekNumber}`}
        leading={<StackBackButton fallbackHref="/app/pregnancy" />}
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        <h1 className="text-xl font-semibold">
          {content?.title || `Pregnancy week ${weekNumber}`}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {content?.summary || "Content for this week is not available yet."}
        </p>
        {content?.trimester ? (
          <p className="text-xs font-medium text-primary">
            Trimester {content.trimester}
          </p>
        ) : null}
      </div>
    </>
  )
}
