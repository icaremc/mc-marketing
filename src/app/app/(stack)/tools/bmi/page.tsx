import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { BmiCalculator } from "@/components/app/tool-calculators"

export default function BmiPage() {
  return (
    <>
      <AppTopBar title="BMI" leading={<StackBackButton fallbackHref="/app/tools" />} />
      <div className="px-4 py-5">
        <BmiCalculator />
      </div>
    </>
  )
}
