import Link from "next/link"
import { Bell, MessageCircle } from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import {
  fetchDoctorAppointments,
  fetchDoctorMe,
  fetchDoctorWallet,
} from "@/lib/api/doctor-practice"

export default async function DoctorDashboardPage() {
  const [me, appointments, wallet] = await Promise.all([
    fetchDoctorMe(),
    fetchDoctorAppointments(),
    fetchDoctorWallet(),
  ])

  const pending = appointments.filter((a) =>
    ["pending", "confirmed"].includes(a.status.toLowerCase()),
  )
  const firstName = me?.name?.split(/\s+/)[0] || "Doctor"

  return (
    <>
      <AppTopBar
        title="ICare Doctors"
        actions={
          <div className="flex items-center gap-1">
            <Link
              href="/doctors/app/notifications"
              className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </Link>
            <Link
              href="/doctors/app/messages"
              className="inline-flex size-10 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Messages"
            >
              <MessageCircle className="size-5" />
            </Link>
          </div>
        }
      />
      <div className="flex flex-col gap-4 px-4 py-5">
        <div>
          <p className="text-sm font-medium text-primary">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Hello, Dr. {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {me?.specialty || "Practice overview"}
            {me?.verified ? " · Verified" : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Upcoming</p>
            <p className="mt-1 text-2xl font-semibold">{pending.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Wallet</p>
            <p className="mt-1 text-2xl font-semibold">
              {wallet
                ? `${Math.round(wallet.balance).toLocaleString()}`
                : "—"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {wallet?.currency ?? "ETB"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/doctors/app/appointments", label: "Appointments" },
            { href: "/doctors/app/services", label: "Services" },
            { href: "/doctors/app/availability", label: "Availability" },
            { href: "/doctors/app/wallet", label: "Wallet" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Next appointments</h2>
            <Link
              href="/doctors/app/appointments"
              className="text-xs text-primary"
            >
              See all
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No upcoming appointments.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <p className="text-sm font-medium">{item.patientName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.serviceName}
                    {item.scheduledAt
                      ? ` · ${item.scheduledAt}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
