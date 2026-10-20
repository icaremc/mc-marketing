import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { DueDateCalculator } from "@/components/app/tool-calculators"

export default function DueDatePage() {
  return (
    <>
      <AppTopBar title="Due date" leading={<StackBackButton fallbackHref="/app/tools" />} />
      <div className="px-4 py-5">
        <DueDateCalculator />
      </div>
    </>
  )
}
