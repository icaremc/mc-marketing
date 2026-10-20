import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"

export default function BankFormPage() {
  return (
    <>
      <AppTopBar title="Add bank" leading={<StackBackButton fallbackHref="/doctors/app/bank" />} />
      <div className="px-4 py-5">
        <ApiForm path="doctor/payout-methods" redirectTo="/doctors/app/bank" submitLabel="Save">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Bank name</span>
            <input name="bank_name" required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Account holder</span>
            <input name="holder_name" required className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Account number</span>
            <input name="account_number" required className="h-10 rounded-md border border-input px-3" />
          </label>
        </ApiForm>
      </div>
    </>
  )
}
