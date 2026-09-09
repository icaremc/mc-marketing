"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

type SubscribeCheckoutProps = {
  yearlyPrice: number
  currency: string
  feePercent: number
  checkoutTotal: number
  enabled: boolean
  signedIn: boolean
}

export function SubscribeCheckout({
  yearlyPrice,
  currency,
  feePercent,
  checkoutTotal,
  enabled,
  signedIn,
}: SubscribeCheckoutProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function startCheckout() {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/subscription/checkout", { method: "POST" })
      const data = (await response.json()) as {
        error?: string
        checkoutUrl?: string
      }
      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Could not start payment.")
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!enabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Subscriptions are not available right now. Download the app or contact support.
      </p>
    )
  }

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Sign in with your ICare MC account to pay for the yearly plan.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-border bg-muted/40 p-5">
        <p className="text-sm text-muted-foreground">Yearly membership</p>
        <p className="mt-1 font-heading text-3xl font-semibold text-foreground">
          {yearlyPrice.toLocaleString()} {currency}
        </p>
        {feePercent > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Checkout total with gateway fee ({feePercent}%):{" "}
            <span className="font-medium text-foreground">
              {checkoutTotal.toLocaleString()} {currency}
            </span>
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="button" size="lg" onClick={() => void startCheckout()} disabled={loading}>
        {loading ? "Opening Chapa…" : "Pay with Chapa"}
      </Button>

      <p className="text-xs text-muted-foreground">
        You will be redirected to Chapa to complete payment securely. After payment, your plan
        activates automatically.
      </p>
    </div>
  )
}
