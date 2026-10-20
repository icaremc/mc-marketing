import Link from "next/link"
import {
  Baby,
  ChevronRight,
  CreditCard,
  Settings,
  UserRound,
  Wallet,
} from "lucide-react"

import { LogoutButton } from "@/components/app/logout-button"
import { fetchChildren } from "@/lib/api/children"
import { fetchAppSubscription } from "@/lib/api/doctor-practice"
import { fetchPatientProfile } from "@/lib/api/profile"
import { fetchPatientWallet } from "@/lib/api/wallet"

function SettingsRow({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string
  icon: typeof UserRound
  title: string
  subtitle?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
  )
}

export default async function PatientProfilePage() {
  const [profile, subscription, wallet, children] = await Promise.all([
    fetchPatientProfile(),
    fetchAppSubscription(),
    fetchPatientWallet(),
    fetchChildren(),
  ])

  const showChildren =
    profile?.userTrackingType === "baby" ||
    profile?.userTrackingType === "both"
  const childCount = children.length
  const childrenSubtitle =
    childCount === 0
      ? "No baby profile yet"
      : childCount === 1
        ? "1 child"
        : `${childCount} children`

  const membershipSubtitle = subscription?.active
    ? subscription.endsAt
      ? `Active until ${new Date(subscription.endsAt).toLocaleDateString()}`
      : "Active"
    : "Inactive — tap to subscribe"

  return (
    <div className="flex flex-col px-4 pb-6 pt-3">
      <div className="rounded-lg bg-primary px-4 pb-3.5 pt-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex size-[46px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-lg font-bold">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              (profile?.fullName || "U").slice(0, 1)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold">
              {profile?.fullName || "Your profile"}
            </p>
            <p className="mt-0.5 truncate text-sm text-primary-foreground/85">
              {profile?.phone || "—"}
            </p>
          </div>
        </div>
      </div>

      <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Account
      </p>
      <div className="overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <SettingsRow
          href="/app/profile/edit"
          icon={UserRound}
          title="Update profile"
          subtitle={profile?.accountType || "Mother"}
        />
        <div className="mx-4 h-px bg-border" />
        <SettingsRow
          href="/subscribe"
          icon={CreditCard}
          title="Membership"
          subtitle={membershipSubtitle}
        />
        <div className="mx-4 h-px bg-border" />
        <SettingsRow
          href="/app/wallet"
          icon={Wallet}
          title="Wallet"
          subtitle={`${(wallet?.balance ?? 0).toLocaleString()} ${wallet?.currency ?? "ETB"}`}
        />
        {showChildren ? (
          <>
            <div className="mx-4 h-px bg-border" />
            <SettingsRow
              href="/app/settings/children"
              icon={Baby}
              title="Children"
              subtitle={childrenSubtitle}
            />
          </>
        ) : null}
      </div>

      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        More
      </p>
      <div className="overflow-hidden rounded-xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
        <SettingsRow
          href="/app/settings"
          icon={Settings}
          title="Settings"
          subtitle="Theme, language, notifications"
        />
        <div className="mx-4 h-px bg-border" />
        <SettingsRow
          href="/app/appointments"
          icon={CreditCard}
          title="Appointments"
        />
        <div className="mx-4 h-px bg-border" />
        <div className="px-4 py-3">
          <LogoutButton redirectTo="/login" />
        </div>
      </div>
    </div>
  )
}
