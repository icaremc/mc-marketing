"use client"

/**
 * Previous scan receipt form — disabled while web scan is "coming soon".
 * Re-enable by restoring this component in page.tsx.
 */

import * as React from "react"
import { Loader2Icon, UploadIcon } from "lucide-react"

import { VerifyResultCard } from "@/components/dashboard/verify-result-card"
import { useRequireSession } from "@/components/dashboard/session-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHODS,
  paymentMethodNeedsWalletFields,
  type PaymentMethodSlug,
} from "@/lib/payment-methods"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export function ScanReceiptForm() {
  const session = useRequireSession()
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethodSlug>(DEFAULT_PAYMENT_METHOD)
  const [phone, setPhone] = React.useState("")
  const [account, setAccount] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<Record<string, unknown> | null>(
    null
  )
  const [loading, setLoading] = React.useState(false)

  const needsWalletFields = paymentMethodNeedsWalletFields(paymentMethod)

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]
    if (!picked) return
    setFile(picked)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(picked)
    setPreview(url)
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault()
    if (!file) {
      setError("Choose a receipt image first.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("payment_method", paymentMethod)
      form.append("business_id", session.businessId)
      if (needsWalletFields && phone.trim()) form.append("phone", phone.trim())
      if (needsWalletFields && account.trim()) {
        form.append("account", account.trim())
      }

      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: form,
      })

      const data = (await response.json()) as Record<string, unknown> & {
        error?: string
      }
      if (!response.ok) {
        throw new Error(data.error?.toString() ?? "Verification failed.")
      }
      setResult(data)
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Verification failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Verify payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleVerify}>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Payment method</span>
              <select
                required
                className={inputClassName}
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethodSlug)
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            {needsWalletFields ? (
              <>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Phone (optional)</span>
                  <input
                    className={inputClassName}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09XXXXXXXX"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Account (optional)</span>
                  <input
                    className={inputClassName}
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  />
                </label>
              </>
            ) : null}

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Receipt image</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                className="text-sm"
              />
            </label>

            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-64 w-full rounded-2xl border object-contain"
              />
            ) : null}

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden />
                  Verifying…
                </>
              ) : (
                <>
                  <UploadIcon aria-hidden />
                  Verify receipt
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result ? (
        <VerifyResultCard
          result={result}
          paymentMethodLabel={
            PAYMENT_METHODS.find((m) => m.slug === paymentMethod)?.label
          }
        />
      ) : null}
    </>
  )
}
