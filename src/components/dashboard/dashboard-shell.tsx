"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOutIcon, MenuIcon } from "lucide-react"

import { TelegramCommunityLink } from "@/components/auth/telegram-community-link"
import { useSession } from "@/store/useSession"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { roleDisplayName } from "@/lib/auth-role"
import { navItemsForRole } from "@/lib/dashboard-nav"
import { cn } from "@/lib/utils"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, ready, logout, setBusinessId } = useSession()

  React.useEffect(() => {
    if (!ready) return
    if (!session) {
      router.replace("/login")
    }
  }, [ready, session, router])

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  const navItems = navItemsForRole(session.role)
  const activeBusiness =
    session.businesses.find((b) => b.id === session.businessId)?.name ??
    "Business"

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col md:min-h-screen">
        <div className="border-b px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Image src="/logo-icon.png" alt="" width={32} height={32} aria-hidden />
            <span>TinaVerify</span>
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            {session.user.name} · {roleDisplayName(session.role)}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Dashboard">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  item.comingSoon && !active && "opacity-80"
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  {item.label}
                  {item.comingSoon ? (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                      Soon
                    </span>
                  ) : null}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto border-t p-3">
          <TelegramCommunityLink variant="tile" className="mb-3" />
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOutIcon className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <MenuIcon className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="border-b px-4 py-4 font-semibold">TinaVerify</div>
                <nav className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Icon className="size-4" aria-hidden />
                        <span className="flex flex-1 items-center justify-between gap-2">
                          {item.label}
                          {item.comingSoon ? (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Soon
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="border-t p-3">
                  <TelegramCommunityLink variant="banner" />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-semibold">TinaVerify</span>
          </div>

          <div className="min-w-0 flex-1 md:max-w-xs">
            {session.role === "owner" && session.businesses.length > 1 ? (
              <label className="flex flex-col gap-1 text-xs">
                <span className="text-muted-foreground">Business</span>
                <select
                  className="h-9 rounded-xl border border-input bg-background px-2 text-sm"
                  value={session.businessId}
                  onChange={(e) => {
                    setBusinessId(e.target.value)
                    router.refresh()
                  }}
                >
                  {session.businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="truncate text-sm text-muted-foreground">{activeBusiness}</p>
            )}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <TelegramCommunityLink variant="header" />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOutIcon className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-8">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background/95 backdrop-blur md:hidden"
          aria-label="Mobile dashboard"
        >
          {navItems.slice(0, 5).map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
                  item.comingSoon && !active && "opacity-70"
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span>{item.label}</span>
                {item.comingSoon ? (
                  <span className="text-[9px] leading-none text-muted-foreground">
                    Soon
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
