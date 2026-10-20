import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { LogoutButton } from "@/components/app/logout-button"
import { fetchDoctorMe } from "@/lib/api/doctor-practice"

export default async function DoctorProfilePage() {
  const me = await fetchDoctorMe()

  return (
    <>
      <AppTopBar title="Profile" />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-lg font-semibold text-primary">
            {me?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              (me?.name || "D").slice(0, 1)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{me?.name || "Doctor"}</p>
            <p className="truncate text-sm text-muted-foreground">
              {me?.specialty || "—"}
            </p>
            {me?.referralCode ? (
              <p className="mt-1 text-xs text-primary">
                Referral: {me.referralCode}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { href: "/doctors/app/profile/details", label: "Personal details" },
            { href: "/doctors/app/profile/verify", label: "Verify documents" },
            { href: "/doctors/app/services", label: "Services" },
            { href: "/doctors/app/availability", label: "Availability" },
            { href: "/doctors/app/bank", label: "Bank details" },
            { href: "/doctors/app/referrals", label: "Referrals" },
            { href: "/doctors/app/hospitals", label: "Hospitals" },
            { href: "/doctors/app/settings", label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          <LogoutButton redirectTo="/doctors/login" />
        </div>
      </div>
    </>
  )
}
