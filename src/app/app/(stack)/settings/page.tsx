import Link from "next/link"

import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

const LINKS = [
  { href: "/app/settings/language", label: "Language" },
  { href: "/app/settings/theme", label: "Theme" },
  { href: "/app/settings/notifications", label: "Notifications" },
  { href: "/app/settings/baby", label: "Baby preferences" },
  { href: "/app/settings/children", label: "Children" },
  { href: "/app/profile/edit", label: "Edit profile" },
  { href: "/app/wallet", label: "Wallet" },
]

export default async function SettingsPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Settings" leading={<StackBackButton fallbackHref="/app/profile" />} />
      <div className="flex flex-col gap-2 px-4 py-5">
        <p className="mb-2 text-sm text-muted-foreground">
          Signed in as {profile?.phone || profile?.fullName || "member"}
        </p>
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">
            {link.label}
          </Link>
        ))}
      </div>
    </>
  )
}
