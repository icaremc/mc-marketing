"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CheckIcon,
  ChevronLeftIcon,
  Building2Icon,
  GiftIcon,
  Loader2Icon,
  LockIcon,
  MapPinIcon,
  PhoneIcon,
  StoreIcon,
} from "lucide-react"

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
import { buildLoginPath } from "@/lib/activation-redirect"
import {
  isValidEthiopianPhone,
  validateRegisterAccountStep,
  validateRegisterPayload,
} from "@/lib/register-validation"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type RegisterStep = "phone" | "account" | "business"

const STEPS: { id: RegisterStep; label: string }[] = [
  { id: "phone", label: "Phone" },
  { id: "account", label: "Account" },
  { id: "business", label: "Business" },
]

type RegisterFormProps = {
  fromIos?: boolean
}

export function RegisterForm({ fromIos = false }: RegisterFormProps) {
  const [step, setStep] = React.useState<RegisterStep>("phone")
  const [passwordVisible, setPasswordVisible] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [otpSent, setOtpSent] = React.useState(false)
  const [otpVerified, setOtpVerified] = React.useState(false)
  const [isSendingOtp, setIsSendingOtp] = React.useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false)
  const [otpCooldown, setOtpCooldown] = React.useState(0)
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [referralCode, setReferralCode] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [branchName, setBranchName] = React.useState("")
  const [branchAddress, setBranchAddress] = React.useState("")

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  React.useEffect(() => {
    if (otpCooldown <= 0) return
    const timer = window.setInterval(() => {
      setOtpCooldown((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [otpCooldown])

  function resetPhoneVerification() {
    setOtpCode("")
    setOtpSent(false)
    setOtpVerified(false)
    setOtpCooldown(0)
    if (step !== "phone") setStep("phone")
  }

  async function handleSendOtp() {
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

    setError(null)
    setIsSendingOtp(true)
    try {
      const response = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? "Could not send verification code.")
      }
      setOtpSent(true)
      setOtpVerified(false)
      setOtpCooldown(60)
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send verification code."
      )
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handleVerifyOtp() {
    const phone = phoneNumber.trim()
    const otp = otpCode.trim()
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your phone.")
      return
    }

    setError(null)
    setIsVerifyingOtp(true)
    try {
      const response = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      })
      const data = (await response.json()) as { verified?: boolean; error?: string }
      if (!response.ok || !data.verified) {
        throw new Error(data.error ?? "Invalid verification code.")
      }
      setOtpVerified(true)
    } catch (verifyError) {
      setOtpVerified(false)
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Could not verify code."
      )
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  function handleContinueFromPhone() {
    if (!otpVerified) {
      setError("Verify your phone number before continuing.")
      return
    }
    setError(null)
    setStep("account")
  }

  function handleContinueToBusiness() {
    const validationError = validateRegisterAccountStep({
      phoneNumber,
      password,
      confirmPassword,
      otpVerified,
    })
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep("business")
  }

  async function handleCreateAccount() {
    const validationError = validateRegisterPayload({
      phoneNumber,
      password,
      otpVerified,
      businessName,
      branchName,
      branchAddress,
    })
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          password: password.trim(),
          referralCode: referralCode.trim() || undefined,
          otpVerified: true,
          businessName: businessName.trim(),
          branchName: branchName.trim(),
          branchAddress: branchAddress.trim(),
        }),
      })

      const data = (await response.json()) as {
        userId?: string
        businessId?: string
        error?: string
      }

      if (!response.ok || !data.userId || !data.businessId) {
        throw new Error(data.error ?? "Registration failed.")
      }

      window.location.href = buildLoginPath({
        userId: data.userId,
        businessId: data.businessId,
        registered: true,
        phone: phoneNumber.trim(),
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Try again."
      )
      setIsSubmitting(false)
    }
  }

  const stepDescription =
    step === "phone"
      ? "Step 1 of 3 — confirm your phone with a one-time code."
      : step === "account"
        ? "Step 2 of 3 — choose a password for your account."
        : "Step 3 of 3 — set up your business and main branch."

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
        <CardTitle className="text-xl">Create account</CardTitle>
        <CardDescription>{stepDescription}</CardDescription>
        <StepIndicator current={stepIndex} />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {error ? (
          <p
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {step === "phone" ? (
          <>
            <Field
              label="Phone number"
              icon={<PhoneIcon className="size-4" aria-hidden />}
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  required
                  type="tel"
                  value={phoneNumber}
                  readOnly={otpVerified}
                  disabled={otpVerified}
                  onChange={(e) => {
                    if (otpVerified) return
                    setPhoneNumber(e.target.value)
                    resetPhoneVerification()
                  }}
                  placeholder="e.g. 0912345678"
                  className={cn(
                    inputClassName,
                    "sm:flex-1",
                    otpVerified && "cursor-not-allowed opacity-70"
                  )}
                  autoComplete="tel"
                  aria-readonly={otpVerified}
                />
                {otpVerified ? (
                  <span
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-3 text-sm font-medium text-primary"
                    aria-label="Phone verified"
                  >
                    <CheckIcon className="size-4" aria-hidden />
                    Verified
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={
                      isSendingOtp ||
                      isSubmitting ||
                      otpCooldown > 0 ||
                      !isValidEthiopianPhone(phoneNumber.trim())
                    }
                    onClick={handleSendOtp}
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2Icon className="animate-spin" aria-hidden />
                        Sending…
                      </>
                    ) : otpCooldown > 0 ? (
                      `Resend (${otpCooldown}s)`
                    ) : otpSent ? (
                      "Resend code"
                    ) : (
                      "Send code"
                    )}
                  </Button>
                )}
              </div>
            </Field>

            {otpSent ? (
              <Field
                label="Verification code"
                hint="6 digits"
                icon={<PhoneIcon className="size-4" aria-hidden />}
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      setOtpVerified(false)
                    }}
                    placeholder="000000"
                    className={cn(inputClassName, "sm:flex-1 tracking-widest")}
                    autoComplete="one-time-code"
                  />
                  <Button
                    type="button"
                    className="shrink-0"
                    disabled={
                      isVerifyingOtp ||
                      isSubmitting ||
                      otpCode.length !== 6 ||
                      otpVerified
                    }
                    onClick={handleVerifyOtp}
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2Icon className="animate-spin" aria-hidden />
                        Checking…
                      </>
                    ) : otpVerified ? (
                      <>
                        <CheckIcon className="size-4" aria-hidden />
                        Verified
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {otpVerified ? (
                  <p className="text-xs text-primary">Phone number verified.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enter the code sent to your phone, then tap Verify.
                  </p>
                )}
              </Field>
            ) : (
              <p className="text-xs text-muted-foreground">
                We send a one-time code to confirm your phone before creating
                your account.
              </p>
            )}
          </>
        ) : null}

        {step === "account" ? (
          <>
            <p className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
              <span className="font-medium text-primary">Phone verified.</span>{" "}
              <button
                type="button"
                className="text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setError(null)
                  setStep("phone")
                }}
              >
                Change number
              </button>
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={passwordVisible}
                onChange={(e) => setPasswordVisible(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              <span className="text-muted-foreground">Show passwords</span>
            </label>
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={setPassword}
              visible={passwordVisible}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm password"
              required
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={passwordVisible}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {confirmPassword.trim() &&
            password.trim() &&
            confirmPassword.trim() !== password.trim() ? (
              <p className="text-sm text-destructive" role="alert">
                Passwords do not match.
              </p>
            ) : null}
            <Field
              label="Referral code"
              hint="Optional"
              icon={<GiftIcon className="size-4" aria-hidden />}
            >
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Optional"
                className={inputClassName}
              />
            </Field>
          </>
        ) : null}

        {step === "business" ? (
          <>
            <p className="text-sm text-muted-foreground">
              Tell us about your business. You can add more branches later in
              the dashboard.
            </p>
            <Field
              label="Business name"
              required
              icon={<Building2Icon className="size-4" aria-hidden />}
            >
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Abebe Restaurant"
                className={inputClassName}
              />
            </Field>
            <Field
              label="Main branch name"
              required
              icon={<StoreIcon className="size-4" aria-hidden />}
            >
              <input
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Main Branch"
                className={inputClassName}
              />
            </Field>
            <Field
              label="Branch address"
              required
              icon={<MapPinIcon className="size-4" aria-hidden />}
            >
              <input
                required
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                placeholder="e.g. Bole, Addis Ababa"
                className={inputClassName}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              After registration, sign in to activate your subscription and use
              the dashboard.
            </p>
          </>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 [.border-t]:border-t">
        <div className="flex w-full gap-2">
          {step !== "phone" ? (
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              disabled={isSubmitting}
              onClick={() => {
                setError(null)
                setStep(step === "business" ? "account" : "phone")
              }}
            >
              <ChevronLeftIcon className="size-4" aria-hidden />
              Back
            </Button>
          ) : null}
          {step === "phone" ? (
            <Button
              type="button"
              className="w-full"
              disabled={!otpVerified || isSubmitting}
              onClick={handleContinueFromPhone}
            >
              Continue
            </Button>
          ) : null}
          {step === "account" ? (
            <Button
              type="button"
              className="w-full"
              disabled={
                isSubmitting ||
                password.trim().length < 6 ||
                confirmPassword.trim() !== password.trim()
              }
              onClick={handleContinueToBusiness}
            >
              Continue
            </Button>
          ) : null}
          {step === "business" ? (
            <Button
              type="button"
              className="w-full"
              disabled={isSubmitting}
              onClick={handleCreateAccount}
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" aria-hidden />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          ) : null}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          {fromIos ? " to activate on the web." : " to activate or use the app."}
        </p>
        <TelegramCommunityLink variant="banner" />
      </CardFooter>
    </Card>
  )
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div
      className="mt-4 flex w-full max-w-xs gap-2"
      aria-label={`Step ${current + 1} of ${STEPS.length}`}
    >
      {STEPS.map((s, index) => (
        <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "h-1.5 w-full rounded-full transition-colors",
              index <= current ? "bg-primary" : "bg-muted"
            )}
          />
          <span
            className={cn(
              "text-[10px] font-medium",
              index === current ? "text-primary" : "text-muted-foreground"
            )}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function PasswordInput({
  label,
  required,
  value,
  onChange,
  visible,
  placeholder,
  autoComplete,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  visible: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <Field label={label} required={required} icon={<LockIcon className="size-4" aria-hidden />}>
      <input
        required={required}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete={autoComplete}
      />
    </Field>
  )
}

function Field({
  label,
  hint,
  required,
  icon,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {label}
        {required ? <span className="text-destructive">*</span> : null}
        {hint ? (
          <span className="font-normal text-muted-foreground">({hint})</span>
        ) : null}
      </span>
      {children}
    </label>
  )
}
