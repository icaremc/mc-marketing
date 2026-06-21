"use client"

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  HashIcon,
  UserIcon,
  WalletIcon,
  XCircleIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { parseVerifyResult } from "@/lib/verify-result"
import { cn } from "@/lib/utils"

type VerifyResultCardProps = {
  result: Record<string, unknown>
  paymentMethodLabel?: string
}

const toneStyles = {
  success: {
    icon: CheckCircle2Icon,
    ring: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    status: "text-emerald-700 dark:text-emerald-400",
  },
  error: {
    icon: XCircleIcon,
    ring: "border-destructive/30 bg-destructive/10 text-destructive",
    status: "text-destructive",
  },
  pending: {
    icon: ClockIcon,
    ring: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    status: "text-amber-800 dark:text-amber-300",
  },
  neutral: {
    icon: AlertCircleIcon,
    ring: "border-border bg-muted text-muted-foreground",
    status: "text-foreground",
  },
} as const

export function VerifyResultCard({
  result,
  paymentMethodLabel,
}: VerifyResultCardProps) {
  const parsed = parseVerifyResult(result)
  if (!parsed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>Could not read the verification response.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const style = toneStyles[parsed.tone]
  const HeroIcon = style.icon

  const detailRows: {
    icon: typeof HashIcon
    label: string
    value: string
    mono?: boolean
  }[] = []

  if (parsed.status) {
    detailRows.push({
      icon: HeroIcon,
      label: "Status",
      value: parsed.status.replace(/_/g, " "),
    })
  }
  if (parsed.referenceNumber) {
    detailRows.push({
      icon: HashIcon,
      label: "Reference",
      value: parsed.referenceNumber,
      mono: true,
    })
  }
  if (parsed.senderName || parsed.senderAccount) {
    detailRows.push({
      icon: UserIcon,
      label: "Sender",
      value: [parsed.senderName, parsed.senderAccount]
        .filter(Boolean)
        .join(" · "),
    })
  }
  if (parsed.receiverName || parsed.receiverAccount) {
    detailRows.push({
      icon: WalletIcon,
      label: "Receiver",
      value: [parsed.receiverName, parsed.receiverAccount]
        .filter(Boolean)
        .join(" · "),
    })
  }

  return (
    <Card>
      <CardHeader className="gap-3">
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl border px-4 py-3",
            style.ring
          )}
        >
          <HeroIcon className="mt-0.5 size-6 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{parsed.statusLabel}</CardTitle>
            {paymentMethodLabel ? (
              <CardDescription className="mt-0.5">
                {paymentMethodLabel}
              </CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {parsed.amountLabel ? (
          <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Amount
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
              {parsed.amountLabel}
            </p>
          </div>
        ) : null}

        {parsed.errorMessage ? (
          <div
            className="flex gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            role="alert"
          >
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="min-w-0 leading-snug">{parsed.errorMessage}</p>
          </div>
        ) : null}

        {detailRows.length > 0 ? (
          <dl className="flex flex-col gap-2 rounded-2xl border px-3 py-2">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex gap-3 border-b border-border/60 py-2.5 last:border-0"
              >
                <row.icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-medium text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 text-sm font-medium capitalize",
                      row.label === "Status" && style.status,
                      row.mono && "font-mono text-xs tracking-wide normal-case"
                    )}
                  >
                    {row.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}

        {parsed.receiptUrl ? (
          <a
            href={parsed.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View receipt
          </a>
        ) : null}

        {parsed.tone === "success" ? (
          <p className="text-xs text-muted-foreground">
            This payment was recorded. You can review it under Transactions.
          </p>
        ) : parsed.tone === "error" ? (
          <p className="text-xs text-muted-foreground">
            Check the reference on the receipt and try again, or confirm the
            payment in your wallet app before rescanning.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
