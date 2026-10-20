import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { BpClassifier } from "@/components/app/tool-calculators"

export default function BpPage() {
  return (
    <>
      <AppTopBar title="Blood pressure" leading={<StackBackButton fallbackHref="/app/tools" />} />
      <div className="px-4 py-5">
        <BpClassifier />
      </div>
    </>
  )
}
