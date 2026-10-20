import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorPayoutMethods } from "@/lib/api/doctor-ops"
import { str } from "@/lib/api/list"

export default async function BankPage() {
  const methods = await fetchDoctorPayoutMethods()
  return (
    <>
      <AppTopBar
        title="Bank accounts"
        leading={<StackBackButton fallbackHref="/doctors/app/profile" />}
        actions={
          <Link href="/doctors/app/bank/form" className="text-sm font-semibold text-primary">
            Add
          </Link>
        }
      />
      <div className="flex flex-col gap-2 px-4 py-4">
        {methods.length === 0 ? (
          <EmptyState>No payout methods yet.</EmptyState>
        ) : (
          methods.map((row, i) => (
            <ListCard
              key={str(row, "id") || String(i)}
              title={str(row, "bank_name") || str(row, "holder_name") || "Account"}
              subtitle={str(row, "account_number") || str(row, "masked_account") || str(row, "holder_name")}
            />
          ))
        )}
      </div>
    </>
  )
}
