"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buildActivationPath, buildLoginPath } from "@/lib/activation-redirect"
import { readAuthSession } from "@/lib/auth-session"
import { buildSuccessRedirectPath, readCheckoutContext } from "@/lib/payment-return"

function txRefFromSearchParams(searchParams: URLSearchParams): string | null {
  const raw =
    searchParams.get("trx_ref") ??
    searchParams.get("tx_ref") ??
    searchParams.get("reference")
  const trimmed = raw?.trim()
  return trimmed ? trimmed : null
}

export function PaymentReturnClient() {
  const searchParams = useSearchParams()
  const [status, setStatus] = React.useState<"loading" | "redirect" | "missing">(
    "loading"
  )
  const [txRef, setTxRef] = React.useState<string | null>(null)
  const [loginHref, setLoginHref] = React.useState("/login")
  const [successHref, setSuccessHref] = React.useState<string | null>(null)
  const [activationHref, setActivationHref] = React.useState<string | null>(
    null
  )

  React.useEffect(() => {
    const fromUrl = txRefFromSearchParams(searchParams)
    const ctx = readCheckoutContext()
    const session = readAuthSession()
    const resolvedTxRef = fromUrl ?? ctx.pendingTxRef

    const userId = ctx.userId ?? session?.userId ?? null
    const businessId = ctx.businessId ?? session?.businessId ?? null

    setTxRef(resolvedTxRef ?? null)

    if (userId && businessId) {
      setLoginHref(buildLoginPath({ userId, businessId }))
      setActivationHref(buildActivationPath({ userId, businessId }))
      if (resolvedTxRef) {
        setSuccessHref(
          buildSuccessRedirectPath({
            userId,
            businessId,
            txRef: resolvedTxRef,
          })
        )
      }
    }

    if (!resolvedTxRef || !userId || !businessId) {
      setStatus("missing")
      return
    }

    setStatus("redirect")

    if (session?.accessToken) {
      const query = new URLSearchParams({ trx_ref: resolvedTxRef })
      window.location.replace(`/dashboard?${query.toString()}`)
      return
    }

    window.location.replace(
      buildSuccessRedirectPath({
        userId,
        businessId,
        txRef: resolvedTxRef,
      })
    )
  }, [searchParams])

  if (status === "loading" || status === "redirect") {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16 sm:px-6">
          <Card>
            <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 py-12">
              <Loader2Icon
                className="size-8 animate-spin text-primary"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                Confirming your payment…
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete activation</CardTitle>
            <CardDescription>
              We could not match this payment to your session. Open the link
              below on the same browser where you started checkout, or sign in
              again.
            </CardDescription>
          </CardHeader>
          {txRef ? (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transaction reference:{" "}
                <span className="font-mono text-xs text-foreground">{txRef}</span>
              </p>
            </CardContent>
          ) : null}
          <CardFooter className="flex flex-wrap gap-3 [.border-t]:border-t">
            {successHref ? (
              <Button asChild>
                <Link href={successHref}>Confirm payment</Link>
              </Button>
            ) : null}
            <Button asChild variant={successHref ? "outline" : "default"}>
              <Link href={loginHref}>Sign in</Link>
            </Button>
            {activationHref ? (
              <Button asChild variant="outline">
                <Link href={activationHref}>Activation</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
