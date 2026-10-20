import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { fetchDoctorWallet } from "@/lib/api/doctor-practice"

export default async function DoctorPaymentsPage() {
  const wallet = await fetchDoctorWallet()

  return (
    <>
      <AppTopBar title="Payments" />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="rounded-2xl bg-primary px-4 py-5 text-primary-foreground">
          <p className="text-sm text-primary-foreground/90">Available balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {wallet
              ? `${Math.round(wallet.balance).toLocaleString()} ${wallet.currency}`
              : "—"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/doctors/app/wallet"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
          >
            Wallet history
          </Link>
          <Link
            href="/doctors/app/bank"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
          >
            Bank / payout methods
          </Link>
        </div>
      </div>
    </>
  )
}
