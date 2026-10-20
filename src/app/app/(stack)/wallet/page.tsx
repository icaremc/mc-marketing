import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientWallet } from "@/lib/api/wallet"

export default async function WalletPage() {
  const wallet = await fetchPatientWallet()
  return (
    <>
      <AppTopBar title="Wallet" leading={<StackBackButton fallbackHref="/app/profile" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="rounded-2xl bg-primary px-4 py-5 text-primary-foreground">
          <p className="text-sm opacity-90">Balance</p>
          <p className="mt-1 text-3xl font-semibold">
            {(wallet?.balance ?? 0).toLocaleString()} {wallet?.currency ?? "ETB"}
          </p>
        </div>
        {!wallet?.transactions.length ? (
          <EmptyState>No transactions yet.</EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {wallet.transactions.map((tx) => (
              <ListCard
                key={tx.id}
                title={`${tx.amount.toLocaleString()} · ${tx.type || "tx"}`}
                subtitle={tx.note}
                meta={tx.createdAt ? new Date(tx.createdAt).toLocaleString() : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
