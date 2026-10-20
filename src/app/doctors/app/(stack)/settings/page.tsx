import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"

const LINKS = [
  { href: "/doctors/app/profile/details", label: "Profile details" },
  { href: "/doctors/app/profile/verify", label: "Verification" },
  { href: "/doctors/app/services", label: "Services" },
  { href: "/doctors/app/availability", label: "Availability" },
  { href: "/doctors/app/bank", label: "Bank accounts" },
  { href: "/doctors/app/wallet", label: "Wallet" },
  { href: "/doctors/app/referrals", label: "Referrals" },
  { href: "/doctors/app/hospitals", label: "Hospitals" },
  { href: "/doctors/app/notifications", label: "Notifications" },
]

export default function DoctorSettingsPage() {
  return (
    <>
      <AppTopBar title="Settings" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="flex flex-col gap-2 px-4 py-5">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">
            {link.label}
          </Link>
        ))}
      </div>
    </>
  )
}
