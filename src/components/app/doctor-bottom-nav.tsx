"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  LayoutDashboard,
  ReceiptText,
  User,
} from "lucide-react"

import { doctorNavItems, isDoctorNavActive } from "@/lib/app/doctor-nav"
import { cn } from "@/lib/utils"

function NavIcon({
  label,
  active,
}: {
  label: string
  active: boolean
}) {
  const className = cn(
    "size-5",
    active
      ? "text-[var(--icare-nav-active)]"
      : "text-[var(--icare-nav-inactive)]",
  )
  switch (label) {
    case "Dashboard":
      return (
        <LayoutDashboard className={className} strokeWidth={active ? 2.4 : 1.8} />
      )
    case "Appointments":
      return (
        <CalendarDays className={className} strokeWidth={active ? 2.4 : 1.8} />
      )
    case "Payments":
      return (
        <ReceiptText className={className} strokeWidth={active ? 2.4 : 1.8} />
      )
    case "Profile":
      return <User className={className} strokeWidth={active ? 2.4 : 1.8} />
    default:
      return <LayoutDashboard className={className} />
  }
}

export function DoctorBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="app-bottom-nav sticky bottom-0 z-30 shrink-0 bg-[var(--icare-chrome)] pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Doctor main tabs"
    >
      <div className="grid h-16 grid-cols-4 items-center px-1">
        {doctorNavItems.map((item) => {
          const active = isDoctorNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2"
              aria-current={active ? "page" : undefined}
            >
              <NavIcon label={item.label} active={active} />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active
                    ? "text-[var(--icare-nav-active)]"
                    : "text-[var(--icare-nav-inactive)]",
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
