"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { displayPhone } from "@/lib/phone"

type Step = "details" | "otp" | "password"

const fieldClass =
  "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/40"

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [otp, setOtp] = useState("")
  const [verificationId, setVerificationId] = useState("")
  const [phoneE164, setPhoneE164] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)

  useEffect(() => {
    if (resendSeconds <= 0) return
    const id = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [resendSeconds])

  async function sendCode() {
    setError(null)
    if (!acceptedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          referralCode,
          acceptedTerms,
        }),
      })
      const data = (await response.json()) as {
        error?: string
        phone?: string
        verificationId?: string
      }
      if (!response.ok || !data.verificationId || !data.phone) {
        setError(data.error ?? "Could not send verification code.")
        return
      }
      setPhoneE164(data.phone)
      setVerificationId(data.verificationId)
      setOtp("")
      setStep("otp")
      setResendSeconds(60)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneE164 || phone,
          code: otp,
          verificationId,
        }),
      })
      const data = (await response.json()) as { error?: string; phone?: string }
      if (!response.ok) {
        setError(data.error ?? "That code is incorrect or expired.")
        return
      }
      if (data.phone) setPhoneE164(data.phone)
      setPassword("")
      setConfirmPassword("")
      setStep("password")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function createAccount() {
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone: phoneE164 || phone,
          password,
          confirmPassword,
          referralCode,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(data.error ?? "Could not create account.")
        return
      }
      router.push("/subscribe")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function backToDetails() {
    setStep("details")
    setOtp("")
    setVerificationId("")
    setPhoneE164("")
    setResendSeconds(0)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {step === "details" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void sendCode()
          }}
        >
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldClass}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={fieldClass}
              placeholder="09xxxxxxxx or 07xxxxxxxx"
            />
          </div>

          <div>
            <label htmlFor="referralCode" className="text-sm font-medium text-foreground">
              Doctor referral code{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="referralCode"
              name="referralCode"
              value={referralCode}
              onChange={(e) =>
                setReferralCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 8))
              }
              className={fieldClass}
              placeholder="Optional"
              autoCapitalize="characters"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/30 p-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <span className="text-sm leading-relaxed text-foreground">
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={loading || !acceptedTerms} className="w-full">
            {loading ? "Sending code…" : "Send verification code"}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void verifyCode()
          }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Enter verification code</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We sent a code to {displayPhone(phoneE164)}.
            </p>
          </div>
          <div>
            <label htmlFor="otp" className="text-sm font-medium text-foreground">
              Verification code
            </label>
            <input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className={fieldClass}
              placeholder="4-digit code"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Verifying…" : "Verify code"}
          </Button>

          <div className="flex flex-col items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              disabled={loading || resendSeconds > 0}
              onClick={() => void sendCode()}
            >
              {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
            </Button>
            <Button type="button" variant="ghost" onClick={backToDetails}>
              Change number
            </Button>
          </div>
        </form>
      ) : null}

      {step === "password" ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void createAccount()
          }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create your password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a password for your ICare MC account.
            </p>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} mt-0 pr-11`}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" aria-hidden="true" />
                ) : (
                  <EyeIcon className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Confirm password
            </label>
            <div className="relative mt-1.5">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${fieldClass} mt-0 pr-11`}
                placeholder="Repeat password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="size-4" aria-hidden="true" />
                ) : (
                  <EyeIcon className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
