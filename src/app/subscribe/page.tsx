import type { Metadata } from "next"

import { SubscribeCheckout } from "@/components/subscribe-checkout"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/lib/brand"
import { getSessionTokens } from "@/lib/session"
import {
  checkoutTotal,
  fetchChapaSettings,
  fetchMembershipSettings,
} from "@/lib/subscription-settings"

export const metadata: Metadata = {
  title: "Subscribe",
  description: `Get yearly access to ${siteConfig.name} pregnancy and child growth tools.`,
  alternates: { canonical: "/subscribe" },
}

export default async function SubscribePage() {
  const [plan, chapa, session] = await Promise.all([
    fetchMembershipSettings(),
    fetchChapaSettings(),
    getSessionTokens(),
  ])

  const feePercent = chapa?.feePercent ?? 2.5
  const total = checkoutTotal(plan.yearlyPrice, feePercent)

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader variant="page" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-primary">Membership</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Yearly subscription
          </h1>
          <p className="text-pretty text-muted-foreground">
            Unlock the full week-by-week guide, child growth tracking, and premium
            content for one year. Pay securely with Chapa.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <SubscribeCheckout
            yearlyPrice={plan.yearlyPrice}
            currency={plan.currency}
            feePercent={feePercent}
            checkoutTotal={total}
            enabled={plan.enabled}
            signedIn={Boolean(session)}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
