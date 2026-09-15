"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ACTIVATION_TOKEN_KEY } from "@/lib/membership"
import { siteConfig } from "@/lib/brand"

type ActivationCheckoutProps = {
  userId: string
  initialToken?: string
  fromIos?: boolean
}

export function ActivationCheckout({
  userId,
  initialToken,
  fromIos = false,
}: ActivationCheckoutProps) {
  const router = useRouter()
  const [token, setToken] = React.useState(initialToken ?? "")
  const [planLabel, setPlanLabel] = React.useState("Yearly membership")
  const [priceLabel, setPriceLabel] = React.useState("")
  const [feeLabel, setFeeLabel] = React.useState("")
  const [totalLabel, setTotalLabel] = React.useState("")
  const [active, setActive] = React.useState(false)
  const [endsAt, setEndsAt] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [paying, setPaying] = React.useState(false)

  React.useEffect(() => {
    if (initialToken) {
      sessionStorage.setItem(ACTIVATION_TOKEN_KEY, initialToken)
      setToken(initialToken)
      // Strip token from the address bar (same pattern as Tina Verify).
      const url = new URL(window.location.href)
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token")
        window.history.replaceState({}, "", url.toString())
      }
    } else {
      const stored = sessionStorage.getItem(ACTIVATION_TOKEN_KEY)
      if (stored) setToken(stored)
    }
  }, [initialToken])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const planRes = await fetch("/api/membership/plan")
        if (planRes.ok) {
          const plan = (await planRes.json()) as {
            yearlyPrice?: number
            currency?: string
            enabled?: boolean
            feePercent?: number
            feeAmount?: number
            total?: number
            paymentConfigured?: boolean
            source?: { plan?: string; chapa?: string }
          }
          if (!cancelled) {
            setPlanLabel("Yearly membership")
            const currency = plan.currency || "ETB"
            if (plan.yearlyPrice != null) {
              setPriceLabel(
                `${plan.yearlyPrice.toLocaleString()} ${currency} / year`,
              )
            }
            if (
              plan.feePercent != null &&
              plan.feePercent > 0 &&
              plan.feeAmount != null
            ) {
              setFeeLabel(
                `Gateway fee (${plan.feePercent}%): ${plan.feeAmount.toLocaleString()} ${currency}`,
              )
            } else {
              setFeeLabel("")
            }
            if (plan.total != null) {
              setTotalLabel(
                `Total due: ${plan.total.toLocaleString()} ${currency}`,
              )
            } else {
              setTotalLabel("")
            }
            if (plan.enabled === false) {
              setError("Membership is not available right now.")
            } else if (plan.paymentConfigured === false) {
              setError(
                "Online payment is not configured yet. Ask support to enable Chapa in admin payment settings.",
              )
            }
          }
        }

        if (!token) {
          if (!cancelled) setLoading(false)
          return
        }

        const statusRes = await fetch(
          `/api/membership/status?user_id=${encodeURIComponent(userId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (statusRes.ok) {
          const status = (await statusRes.json()) as {
            active?: boolean
            endsAt?: string | null
          }
          if (!cancelled) {
            setActive(Boolean(status.active))
            setEndsAt(status.endsAt ?? null)
          }
        } else if (statusRes.status === 401 || statusRes.status === 403) {
          if (!cancelled) {
            setToken("")
            sessionStorage.removeItem(ACTIVATION_TOKEN_KEY)
          }
        }
      } catch {
        if (!cancelled) setError("Could not load membership status.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token, userId])

  async function startCheckout() {
    if (!token || paying) return
    setPaying(true)
    setError(null)
    try {
      const response = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      })
      const data = (await response.json()) as {
        error?: string
        checkoutUrl?: string
      }
      if (!response.ok || !data.checkoutUrl) {
        setError(data.error || "Could not start checkout.")
        return
      }
      window.location.href = data.checkoutUrl
    } catch {
      setError("Could not start checkout.")
    } finally {
      setPaying(false)
    }
  }

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to continue</CardTitle>
          <CardDescription>
            Sign in on the website to activate your ICare MC account, then open
            the app and sign in there.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link
              href={`/login?from=${fromIos ? "ios" : "web"}&next=/activate/${encodeURIComponent(userId)}`}
            >
              Sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{planLabel}</CardTitle>
        <CardDescription>
          {fromIos
            ? "Complete activation here in Safari. When finished, return to the app and tap Refresh status — or open the app and sign in."
            : "Activate yearly membership for your ICare MC account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Loading…
          </div>
        ) : active ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
            Your membership is active
            {endsAt
              ? ` until ${new Date(endsAt).toLocaleDateString()}`
              : ""}
            .
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/40 p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-heading text-xl font-semibold">
              {priceLabel || "Yearly access"}
            </p>
            {feeLabel ? (
              <p className="text-sm text-muted-foreground">{feeLabel}</p>
            ) : null}
            {totalLabel ? (
              <p className="text-sm font-medium text-foreground">{totalLabel}</p>
            ) : null}
          </div>
        )}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!active ? (
          <Button
            className="w-full"
            size="lg"
            disabled={paying || loading || Boolean(error)}
            onClick={() => void startCheckout()}
          >
            {paying ? <Loader2Icon className="animate-spin" /> : null}
            Continue to payment
          </Button>
        ) : null}
        <Button asChild variant="outline" className="w-full" size="lg">
          <a href={siteConfig.appLoginDeepLink}>
            Open app to sign in
          </a>
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            sessionStorage.removeItem(ACTIVATION_TOKEN_KEY)
            router.push(`/login?from=${fromIos ? "ios" : "web"}`)
          }}
        >
          Use a different account
        </Button>
      </CardFooter>
    </Card>
  )
}
