import type { Metadata } from "next"
import { Suspense } from "react"

import { SubscribeCallbackClient } from "@/components/subscribe-callback-client"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/brand"

export const metadata: Metadata = {
  title: "Payment confirmation",
  description: `Confirming your ${siteConfig.name} subscription payment.`,
  alternates: { canonical: "/subscribe/callback" },
}

export default function SubscribeCallbackPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Payment</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Confirming payment
          </h1>
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <SubscribeCallbackClient />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
