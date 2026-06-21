"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  PhoneIcon,
} from "lucide-react"

import { ForgotPasswordPanel } from "@/components/auth/forgot-password-panel"
import { TelegramCommunityLink } from "@/components/auth/telegram-community-link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  buildActivationPath,
  buildDashboardPath,
  storeActivationToken,
} from "@/lib/activation-redirect"
import {
  buildSessionFromLogin,
} from "@/components/dashboard/session-provider"
import { saveAuthSession } from "@/lib/auth-session"
import type { AppRole } from "@/lib/auth-role"
import type { UserBusiness } from "@/lib/auth-login"
import { isValidEthiopianPhone } from "@/lib/register-validation"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

const REMEMBER_PHONE_KEY = "tinaverify_remember_phone"

type LoginFormProps = {
  presetUserId?: string
  presetBusinessId?: string
  presetPhone?: string
  justRegistered?: boolean
}

export function LoginForm({
  presetUserId,
  presetBusinessId,
  presetPhone = "",
  justRegistered = false,
}: LoginFormProps) {
  const [phoneNumber, setPhoneNumber] = React.useState(presetPhone)
  const [password, setPassword] = React.useState("")
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (presetPhone) return
    const saved = localStorage.getItem(REMEMBER_PHONE_KEY)
    if (saved) setPhoneNumber(saved)
  }, [presetPhone])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const phone = phoneNumber.trim()
    if (!phone) {
      setError("Phone number is required.")
      return
    }
    if (!isValidEthiopianPhone(phone)) {
      setError(
        "Enter a valid Ethiopian phone: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX / +2517XXXXXXXX."
      )
      return
    }
    if (!password.trim()) {
      setError("Password is required.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          password: password.trim(),
        }),
      })

      const data = (await response.json()) as {
        userId?: string
        businessId?: string
        accessToken?: string
        refreshToken?: string
        role?: AppRole
        userName?: string
        businesses?: UserBusiness[]
        error?: string
      }

      if (!response.ok || !data.userId || !data.accessToken) {
        throw new Error(data.error ?? "Login failed.")
      }

      const userId = presetUserId ?? data.userId
      const businessId = presetBusinessId ?? data.businessId

      if (!businessId) {
        throw new Error(
          "No business found for this account. Complete registration first."
        )
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_PHONE_KEY, phone)
      } else {
        localStorage.removeItem(REMEMBER_PHONE_KEY)
      }

      const businesses = data.businesses ?? []
      const session = buildSessionFromLogin({
        userId,
        businessId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.role ?? "owner",
        userName: data.userName ?? "User",
        businesses,
      })
      saveAuthSession(session)

      const statusResults = await Promise.all(
        (businesses.length > 0 ? businesses : [{ id: businessId, name: "" }]).map(
          async (b) => {
            const response = await fetch(
              `/api/activation/status?user_id=${encodeURIComponent(userId)}&business_id=${encodeURIComponent(b.id)}`,
              { headers: { Authorization: `Bearer ${data.accessToken}` } }
            )
            const statusData = (await response.json()) as { active?: boolean }
            return { id: b.id, active: statusData.active === true }
          }
        )
      )

      const targetActive =
        statusResults.find((s) => s.id === businessId)?.active ?? false
      const anyActive = statusResults.some((s) => s.active)

      if (targetActive || (anyActive && businesses.length > 1)) {
        window.location.href = buildDashboardPath()
        return
      }

      storeActivationToken(data.accessToken)
      window.location.href = buildActivationPath({
        userId,
        businessId,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Login failed. Try again."
      )
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <Image
          src="/logo-icon.png"
          alt=""
          width={72}
          height={72}
          className="mb-2"
          aria-hidden
        />
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to verify payments</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {justRegistered ? (
            <p
              className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground"
              role="status"
            >
              Account created successfully. Sign in with your phone and password
              to open your dashboard.
            </p>
          ) : null}

          {error ? (
            <p
              className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {showForgotPassword ? (
            <ForgotPasswordPanel
              initialPhone={phoneNumber}
              onClose={() => setShowForgotPassword(false)}
            />
          ) : null}

          <label className="flex flex-col gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <PhoneIcon className="size-4" aria-hidden />
              Phone number
            </span>
            <input
              required
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 0912345678"
              className={inputClassName}
              autoComplete="tel username"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <LockIcon className="size-4" aria-hidden />
              Password
            </span>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className={cn(inputClassName, "pr-10")}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
                onClick={() => setPasswordVisible((v) => !v)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-2 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setShowForgotPassword((v) => !v)}
            >
              Forgot password?
            </button>
          </div>

        </CardContent>

        <CardFooter className="flex flex-col gap-3 [.border-t]:border-t">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create an account</Link>
          </Button>
          <TelegramCommunityLink variant="banner" />
        </CardFooter>
      </form>
    </Card>
  )
}
