import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchActivePregnancy } from "@/lib/api/pregnancy"
import { fetchChildren } from "@/lib/api/children"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function HealthPage() {
  const [profile, pregnancy, children] = await Promise.all([
    fetchPatientProfile(),
    fetchActivePregnancy(),
    fetchChildren(),
  ])

  return (
    <>
      <AppTopBar title="Health" leading={<StackBackButton fallbackHref="/app" />} />
      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm font-semibold">{profile?.fullName || "You"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tracking: {profile?.userTrackingType || "not set"}
          </p>
        </div>
        {pregnancy ? (
          <Link href="/app/pregnancy" className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-sm font-semibold">Pregnancy · week {pregnancy.weekNumber}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pregnancy.edd ? `EDD ${new Date(pregnancy.edd).toLocaleDateString()}` : "Active"}
            </p>
          </Link>
        ) : null}
        {children[0] ? (
          <Link href="/app/baby" className="rounded-2xl border border-border bg-card px-4 py-4">
            <p className="text-sm font-semibold">{children[0].name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{children[0].ageLabel}</p>
          </Link>
        ) : null}
        <Link href="/app/tools" className="text-sm font-medium text-primary">
          Open health tools →
        </Link>
      </div>
    </>
  )
}
