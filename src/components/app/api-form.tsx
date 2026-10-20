"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent, type ReactNode } from "react"

export function ApiForm({
  method = "POST",
  path,
  body,
  redirectTo,
  submitLabel = "Save",
  children,
  className,
}: {
  method?: "POST" | "PATCH" | "PUT" | "DELETE"
  path: string
  body?: Record<string, unknown> | (() => Record<string, unknown>)
  redirectTo?: string
  submitLabel?: string
  children?: ReactNode
  className?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const form = event.currentTarget
    const fd = new FormData(form)
    const fromForm: Record<string, unknown> = {}
    const numericKeys = new Set([
      "price",
      "amount",
      "duration_minutes",
      "day_of_week",
    ])
    fd.forEach((value, key) => {
      if (typeof value !== "string") return
      if (value === "true") fromForm[key] = true
      else if (value === "false") fromForm[key] = false
      else if (numericKeys.has(key) && value !== "" && Number.isFinite(Number(value)))
        fromForm[key] = Number(value)
      else fromForm[key] = value
    })
    const payload =
      typeof body === "function" ? { ...fromForm, ...body() } : { ...fromForm, ...body }

    try {
      const response = await fetch(
        `/api/backend/${path.replace(/^\//, "")}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: method === "DELETE" ? undefined : JSON.stringify(payload),
        },
      )
      const data = (await response.json().catch(() => null)) as {
        error?: string
      } | null
      if (!response.ok) {
        setError(data?.error || "Request failed.")
        setPending(false)
        return
      }
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
      form.reset()
    } catch {
      setError("Network error.")
    }
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className={className ?? "flex flex-col gap-3"}>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  )
}
