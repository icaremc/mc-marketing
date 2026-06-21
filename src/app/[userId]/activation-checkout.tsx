"use client"

import * as React from "react"
import { Loader2Icon, SparklesIcon, SlidersHorizontalIcon } from "lucide-react"

import type { SubscriptionPlan } from "@/lib/subscription"
import { planCaption, planSubtitle, planTitle } from "@/lib/subscription"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

import {
  ACTIVATION_TOKEN_STORAGE_KEY,
  buildDashboardPath,
  buildLoginPath,
} from "@/lib/activation-redirect"
import type { UserBusiness } from "@/lib/auth-login"
import { pickPrimaryBusinessId } from "@/lib/auth-login"
import {
  CUSTOM_ETB_PER_CREDIT,
  CUSTOM_MIN_AMOUNT_ETB,
  CUSTOM_MIN_CREDITS,
} from "@/lib/pricing-constants"
import { storeCheckoutContext } from "@/lib/payment-return"
import { cn } from "@/lib/utils"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type ActivationCheckoutProps = {
  userId: string
  businessId: string
  accessToken?: string
  businesses?: UserBusiness[]
  onBusinessIdChange?: (businessId: string) => void
}

export function ActivationCheckout({
  userId,
  businessId: initialBusinessId,
  accessToken: initialToken,
  businesses: businessesProp,
  onBusinessIdChange,
}: ActivationCheckoutProps) {
  const [token, setToken] = React.useState(initialToken ?? "")
  const [businesses, setBusinesses] = React.useState<UserBusiness[]>(
    businessesProp ?? []
  )
  const [selectedBusinessId, setSelectedBusinessId] =
    React.useState(initialBusinessId)
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([])
  const [creditsPerEtb, setCreditsPerEtb] = React.useState<number | null>(null)
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("")
  const [customAmount, setCustomAmount] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isPaying, setIsPaying] = React.useState(false)
  const [alreadyActive, setAlreadyActive] = React.useState(false)

  React.useEffect(() => {
    if (initialToken) {
      sessionStorage.setItem(ACTIVATION_TOKEN_STORAGE_KEY, initialToken)
      setToken(initialToken)
    } else {
      const stored = sessionStorage.getItem(ACTIVATION_TOKEN_STORAGE_KEY)
      if (stored) setToken(stored)
    }
  }, [initialToken])

  React.useEffect(() => {
    if (businessesProp?.length) {
      setBusinesses(businessesProp)
    }
  }, [businessesProp])

  React.useEffect(() => {
    setSelectedBusinessId(initialBusinessId)
  }, [initialBusinessId])

  React.useEffect(() => {
    if (!token || businessesProp?.length) return

    let cancelled = false
    async function loadBusinesses() {
      try {
        const response = await fetch("/api/businesses", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await response.json()) as {
          businesses?: UserBusiness[]
        }
        if (!cancelled && response.ok && data.businesses?.length) {
          setBusinesses(data.businesses)
          setSelectedBusinessId((current) =>
            pickPrimaryBusinessId(data.businesses!, current) ?? current
          )
        }
      } catch {
        // keep single-business flow
      }
    }

    loadBusinesses()
    return () => {
      cancelled = true
    }
  }, [token, businessesProp])

  function handleBusinessChange(nextId: string) {
    setSelectedBusinessId(nextId)
    onBusinessIdChange?.(nextId)
    setError(null)
    setAlreadyActive(false)
    setPlans([])
    setSelectedPlanId("")
    setCustomAmount("")
  }

  const selectedBusinessName =
    businesses.find((b) => b.id === selectedBusinessId)?.name ?? null

  React.useEffect(() => {
    if (!token) {
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    async function loadPlans() {
      setLoading(true)
      setError(null)
      setAlreadyActive(false)
      try {
        const statusResponse = await fetch(
          `/api/activation/status?user_id=${encodeURIComponent(userId)}&business_id=${encodeURIComponent(selectedBusinessId)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (statusResponse.ok) {
          const statusData = (await statusResponse.json()) as {
            active?: boolean
          }
          if (statusData.active) {
            if (!cancelled) {
              setAlreadyActive(true)
              setLoading(false)
            }
            return
          }
        }

        const response = await fetch("/api/activation/prices", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await response.json()) as {
          plans?: SubscriptionPlan[]
          creditsPerEtb?: number | null
          error?: string
        }
        if (!response.ok || !data.plans?.length) {
          throw new Error(data.error ?? "No subscription plans available.")
        }
        if (cancelled) return
        setPlans(data.plans)
        setCreditsPerEtb(
          typeof data.creditsPerEtb === "number" && data.creditsPerEtb > 0
            ? data.creditsPerEtb
            : null
        )
        setSelectedPlanId(data.plans[0]?.id ?? "")
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load subscription plans."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPlans()
    return () => {
      cancelled = true
    }
  }, [token, userId, selectedBusinessId])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const customAmountNum = Number.parseFloat(customAmount.trim())
  const computedCredits =
    creditsPerEtb && customAmountNum > 0
      ? Math.round(customAmountNum * creditsPerEtb)
      : 0
  const meetsCustomMinimum =
    customAmountNum >= CUSTOM_MIN_AMOUNT_ETB &&
    computedCredits >= CUSTOM_MIN_CREDITS
  const canPayCustom =
    !isPaying &&
    creditsPerEtb != null &&
    creditsPerEtb > 0 &&
    meetsCustomMinimum
  const canPayPlan =
    !isPaying && !!selectedPlanId && plans.length > 0
  const primaryIsCustom = canPayCustom
  const primaryLabel = primaryIsCustom
    ? `Pay ${customAmountNum.toLocaleString()} ETB`
    : selectedPlan
      ? `Pay ${Math.round(selectedPlan.price).toLocaleString()} ETB`
      : "Pay now"

  async function startCheckout(mode: "plan" | "custom") {
    setError(null)
    setIsPaying(true)

    try {
      const body =
        mode === "custom"
          ? {
              userId,
              businessId: selectedBusinessId,
              mode: "custom" as const,
              amount: customAmountNum,
              credits: computedCredits,
            }
          : {
              userId,
              businessId: selectedBusinessId,
              planId: selectedPlanId,
              mode: "plan" as const,
            }

      const response = await fetch("/api/activation/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = (await response.json()) as {
        checkoutUrl?: string
        txRef?: string
        error?: string
      }

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? "Could not start checkout.")
      }

      storeCheckoutContext({
        userId,
        businessId: selectedBusinessId,
        txRef: data.txRef,
      })
      window.location.href = data.checkoutUrl
    } catch (payError) {
      setError(
        payError instanceof Error
          ? payError.message
          : "Could not start payment. Try again."
      )
      setIsPaying(false)
    }
  }

  const loginHref = buildLoginPath({
    userId,
    businessId: selectedBusinessId,
  })

  const businessSelector =
    businesses.length > 1 ? (
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Business to activate</span>
        <select
          className={inputClassName}
          value={selectedBusinessId}
          disabled={isPaying || loading}
          onChange={(e) => handleBusinessChange(e.target.value)}
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Each business needs its own subscription. Switch here to activate a
          different one.
        </p>
      </label>
    ) : selectedBusinessName ? (
      <p className="rounded-2xl border bg-muted/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Activating: </span>
        <span className="font-medium">{selectedBusinessName}</span>
      </p>
    ) : null

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to activate</CardTitle>
          <CardDescription>
            Sign in with your phone number and password to load subscription plans
            and pay via Chapa. You can also open this page from the TinaVerify app
            while signed in.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 [.border-t]:border-t">
          <Button asChild className="w-full">
            <Link href={loginHref}>Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create an account</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-primary" aria-hidden />
        </CardContent>
      </Card>
    )
  }

  if (alreadyActive) {
    const otherBusinesses = businesses.filter(
      (b) => b.id !== selectedBusinessId
    )
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already activated</CardTitle>
          <CardDescription>
            {selectedBusinessName
              ? `${selectedBusinessName} has an active subscription.`
              : "This business has an active subscription."}{" "}
            Open your dashboard or choose another business to activate.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {businessSelector}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 [.border-t]:border-t">
          <Button asChild className="w-full">
            <Link href={buildDashboardPath()}>Go to dashboard</Link>
          </Button>
          {otherBusinesses.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                const next = otherBusinesses[0]
                if (next) handleBusinessChange(next.id)
              }}
            >
              Activate another business
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 size-8 text-primary" aria-hidden />
          <div>
            <CardTitle>Activate your account</CardTitle>
            <CardDescription className="mt-2">
              Choose a subscription plan or enter a custom amount. Payment is
              processed securely via Chapa (TeleBirr, banks, and mobile wallets).
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {businessSelector}

        {error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {plans.length > 0 ? (
          <>
            <div>
              <h2 className="mb-3 text-sm font-semibold">Choose a plan</h2>
              <div className="flex flex-col gap-2 rounded-2xl border bg-muted/30 p-2">
                {plans.map((plan) => {
                  const selected = plan.id === selectedPlanId
                  const caption = planCaption(plan)
                  return (
                    <label
                      key={plan.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border bg-card p-3 transition-colors",
                        selected
                          ? "border-primary/40 ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/20"
                      )}
                    >
                      <input
                        type="radio"
                        name="plan"
                        className="mt-1"
                        checked={selected}
                        disabled={isPaying}
                        onChange={() => setSelectedPlanId(plan.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{planTitle(plan)}</p>
                        <p className="text-sm text-muted-foreground">
                          {planSubtitle(plan)}
                        </p>
                        {caption ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {caption}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-3 flex items-start gap-2">
                <SlidersHorizontalIcon
                  className="size-5 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <h2 className="text-sm font-semibold">Custom subscription</h2>
                  <p className="text-sm text-muted-foreground">
                    {CUSTOM_ETB_PER_CREDIT.toFixed(2)} ETB per credit. Minimum{" "}
                    {CUSTOM_MIN_CREDITS.toLocaleString()} credits (
                    {CUSTOM_MIN_AMOUNT_ETB.toLocaleString()} ETB).
                  </p>
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">Amount (ETB)</span>
                <input
                  type="number"
                  min={CUSTOM_MIN_AMOUNT_ETB}
                  step={1}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Min ${CUSTOM_MIN_AMOUNT_ETB.toLocaleString()}`}
                  className={inputClassName}
                  disabled={isPaying || !creditsPerEtb}
                />
              </label>
              {creditsPerEtb ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {computedCredits > 0
                    ? `${computedCredits.toLocaleString()} credits · ${CUSTOM_ETB_PER_CREDIT.toFixed(2)} ETB per credit`
                    : `Enter at least ${CUSTOM_MIN_AMOUNT_ETB.toLocaleString()} ETB`}
                  {computedCredits > 0 && !meetsCustomMinimum ? (
                    <span className="mt-1 block text-destructive">
                      Minimum {CUSTOM_MIN_CREDITS.toLocaleString()} credits (
                      {CUSTOM_MIN_AMOUNT_ETB.toLocaleString()} ETB).
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Exchange rate unavailable — use a plan above.
                </p>
              )}
            </div>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 [.border-t]:border-t">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!(primaryIsCustom ? canPayCustom : canPayPlan)}
          onClick={() => startCheckout(primaryIsCustom ? "custom" : "plan")}
        >
          {isPaying ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden />
              Opening payment…
            </>
          ) : (
            primaryLabel
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          After paying on Chapa, if you land on a generic &quot;Redirecting…&quot;
          page instead of TinaVerify, open{" "}
          <Link href="/payments/return" className="font-medium text-primary underline-offset-4 hover:underline">
            complete activation
          </Link>{" "}
          in this browser (same device you used to pay).
        </p>
      </CardFooter>
    </Card>
  )
}
