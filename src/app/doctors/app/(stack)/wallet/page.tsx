import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorWalletHistory } from "@/lib/api/doctor-ops"

export default async function DoctorWalletPage() {
  const wallet = await fetchDoctorWalletHistory()
  return (
    <>
      <AppTopBar title="Wallet" leading={<StackBackButton fallbackHref="/doctors/app/payments" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="rounded-2xl bg-primary px-4 py-5 text-primary-foreground">
          <p className="text-sm opacity-90">Available</p>
          <p className="mt-1 text-3xl font-semibold">
            {wallet.balance.toLocaleString()} {wallet.currency}
          </p>
        </div>
        {wallet.payouts.length === 0 ? (
          <EmptyState>No payouts yet.</EmptyState>
        ) : (
          wallet.payouts.map((p) => (
            <ListCard
              key={p.id}
              title={`${p.amount.toLocaleString()} ${wallet.currency}`}
              subtitle={p.status}
              meta={p.createdAt ? new Date(p.createdAt).toLocaleString() : undefined}
            />
          ))
        )}
      </div>
    </>
  )
}
