"use client"

import * as React from "react"
import { Loader2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { isValidEthiopianPhone } from "@/lib/register-validation"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export function ForgotPasswordPanel({
  initialPhone,
  onClose,
}: {
  initialPhone: string
  onClose: () => void
}) {
  const [phone, setPhone] = React.useState(initialPhone)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [isSending, setIsSending] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = phone.trim()
    if (!value) {
      setError("Phone number is required.")
      return
    }
    if (!isValidEthiopianPhone(value)) {
      setError("Enter a valid Ethiopian phone number.")
      return
    }

    setError(null)
    setSuccess(null)
    setIsSending(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: value }),
      })
      const data = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? "Could not send reset instructions.")
      }
      setSuccess(
        data.message ??
          "If an account exists for this number, check your phone for next steps."
      )
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send reset instructions."
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">Reset your password</p>
          <p className="text-sm text-muted-foreground">
            Use the phone number you use to sign in. If it is registered, we will
            text you how to set a new password.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0912345678"
          className={inputClassName}
          autoComplete="tel"
        />
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-primary" role="status">
            {success}
          </p>
        ) : null}
        <Button type="submit" disabled={isSending} className="w-full">
          {isSending ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            "Send reset instructions"
          )}
        </Button>
      </form>
    </div>
  )
}
