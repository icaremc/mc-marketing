"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ACTIVATION_TOKEN_KEY } from "@/lib/membership"

const inputClassName =
  "h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type RegisterFormProps = {
  fromIos?: boolean
}

export function RegisterForm({ fromIos = false }: RegisterFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, password }),
      })
      const data = (await response.json()) as {
        error?: string
        userId?: string
        accessToken?: string | null
        needsSignIn?: boolean
      }
      if (!response.ok || !data.userId) {
        setError(data.error || "Could not create account.")
        return
      }

      if (data.accessToken) {
        sessionStorage.setItem(ACTIVATION_TOKEN_KEY, data.accessToken)
        router.push(
          `/activate/${encodeURIComponent(data.userId)}${fromIos ? "?from=ios" : ""}`,
        )
        return
      }

      router.push(
        `/login?from=${fromIos ? "ios" : "web"}&registered=1`,
      )
    } catch {
      setError("Could not reach the server. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          autoComplete="name"
          className={inputClassName}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="09XXXXXXXX"
          className={inputClassName}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={busy} size="lg">
        {busy ? <Loader2Icon className="animate-spin" /> : null}
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${fromIos ? "?from=ios" : ""}`}
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
