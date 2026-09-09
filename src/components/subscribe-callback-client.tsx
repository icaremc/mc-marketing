"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { StoreBadges } from "@/components/store-badges"

export function SubscribeCallbackClient() {
  const searchParams = useSearchParams()
  const txRef = searchParams.get("tx_ref") ?? searchParams.get("trx_ref") ?? ""
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Confirming your payment…")

  useEffect(() => {
    if (!txRef) {
      setStatus("error")
      setMessage("Missing payment reference.")
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const response = await fetch("/api/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txRef }),
        })
        const data = (await response.json()) as { error?: string; ok?: boolean }
        if (cancelled) return
        if (!response.ok) {
          setStatus("error")
          setMessage(data.error ?? "Could not activate your subscription.")
          return
        }
        setStatus("success")
        setMessage("Your yearly membership is active.")
      } catch {
        if (cancelled) return
        setStatus("error")
        setMessage("Something went wrong while confirming payment.")
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [txRef])

  return (
    <div className="flex flex-col gap-5">
      <p
        className={
          status === "error"
            ? "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            : status === "success"
              ? "rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
              : "text-sm text-muted-foreground"
        }
      >
        {message}
      </p>

      {status === "success" ? (
        <div>
          <p className="text-sm font-medium text-foreground">
            Download the app or open it on your phone to continue.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with the same phone number to use your membership.
          </p>
          <StoreBadges className="mt-4" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/subscribe">Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
