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

export function DoctorRegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("details")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [specialty, setSpecialty] = useState("General")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [otp, setOtp] = useState("")
  const [phoneE164, setPhoneE164] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
      const response = await fetch("/api/auth/doctor/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, acceptedTerms }),
      })
      const data = (await response.json()) as { error?: string; phone?: string }
      if (!response.ok || !data.phone) {
        setError(data.error ?? "Could not send verification code.")
        return
      }
      setPhoneE164(data.phone)
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
        body: JSON.stringify({ phone: phoneE164 || phone, code: otp }),
      })
      const data = (await response.json()) as { error?: string; phone?: string }
      if (!response.ok) {
        setError(data.error ?? "Could not verify code.")
        return
      }
      if (data.phone) setPhoneE164(data.phone)
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
      const response = await fetch("/api/auth/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phoneE164 || phone,
          password,
          confirmPassword,
          specialty,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(data.error ?? "Could not create account.")
        return
      }
      router.push("/doctors/app")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={fieldClass}
              placeholder="09xxxxxxxx"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Specialty</label>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className={fieldClass}
              placeholder="General"
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 size-4"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-primary underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/doctors/privacy" className="text-primary underline">
                Doctor Privacy
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Sending…" : "Send verification code"}
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
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {displayPhone(phoneE164)}.
          </p>
          <div>
            <label className="text-sm font-medium">Verification code</label>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={fieldClass}
              placeholder="6-digit code"
            />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Verifying…" : "Verify code"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading || resendSeconds > 0}
            onClick={() => void sendCode()}
          >
            {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
          </Button>
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
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${fieldClass} mt-0 pr-11`}
              />
              <button
                type="button"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 p-1.5 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Creating…" : "Create doctor account"}
          </Button>
        </form>
      ) : null}
    </div>
  )
}
