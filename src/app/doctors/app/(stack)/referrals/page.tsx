import { AppTopBar } from "@/components/app/app-top-bar"
import { EmptyState } from "@/components/app/empty-state"
import { ListCard } from "@/components/app/list-card"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorReferrals } from "@/lib/api/doctor-ops"
import { fetchDoctorMe } from "@/lib/api/doctor-practice"
import { str } from "@/lib/api/list"

export default async function ReferralsPage() {
  const [me, referrals] = await Promise.all([fetchDoctorMe(), fetchDoctorReferrals()])
  return (
    <>
      <AppTopBar title="Referrals" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        {me?.referralCode ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-xs text-muted-foreground">Your code</p>
            <p className="mt-1 text-xl font-semibold tracking-wide">{me.referralCode}</p>
          </div>
        ) : null}
        {referrals.length === 0 ? (
          <EmptyState>No referrals recorded yet.</EmptyState>
        ) : (
          referrals.map((row, i) => (
            <ListCard
              key={str(row, "id") || String(i)}
              title={str(row, "referred_name") || str(row, "name") || "Referral"}
              subtitle={str(row, "status")}
            />
          ))
        )}
      </div>
    </>
  )
}
