"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { siteConfig } from "@/lib/brand"
import { ACTIVATION_TOKEN_KEY } from "@/lib/membership"

export function ActivateSuccessClient() {
  const params = useSearchParams()
  const txRef = params.get("tx_ref")?.trim() ?? ""
  const userId = params.get("user_id")?.trim() ?? ""
  const [status, setStatus] = React.useState<"working" | "ok" | "error">(
    "working",
  )
  const [message, setMessage] = React.useState("Confirming your payment…")

  React.useEffect(() => {
    let cancelled = false
    async function finalize() {
      const token = sessionStorage.getItem(ACTIVATION_TOKEN_KEY)
      if (!token || !txRef || !userId) {
        if (!cancelled) {
          setStatus("error")
          setMessage(
            "Payment return is missing session details. Open the app, sign in, and tap Refresh status.",
          )
        }
        return
      }

      try {
        const response = await fetch("/api/membership/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, txRef }),
        })
        const data = (await response.json()) as { error?: string; ok?: boolean }
        if (!cancelled) {
          if (response.ok && data.ok) {
            setStatus("ok")
            setMessage(
              "Membership is active. Open the ICare MC app and sign in with your phone and password.",
            )
          } else {
            setStatus("error")
            setMessage(
              data.error ||
                "Could not confirm payment yet. Return to the app and tap Refresh status.",
            )
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("error")
          setMessage(
            "Could not confirm payment. Open the app and tap Refresh status.",
          )
        }
      }
    }
    void finalize()
    return () => {
      cancelled = true
    }
  }, [txRef, userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {status === "ok" ? "You are all set" : "Finishing up"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "working" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            Please wait…
          </div>
        ) : null}
        {status === "ok" ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2Icon className="size-5" />
            You can close Safari and continue in the app.
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full" size="lg">
          <a href={siteConfig.appLoginDeepLink}>Open app to sign in</a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={siteConfig.appStoreUrl}>Get the app on the App Store</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
