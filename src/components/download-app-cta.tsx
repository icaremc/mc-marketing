"use client"

import * as React from "react"

import { StoreBadges } from "@/components/store-badges"
import { cn } from "@/lib/utils"

type Platform = "ios" | "android" | "other"

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other"
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "other"
}

export function DownloadAppCta({
  className,
  title = "Download TinaVerify",
  description,
}: {
  className?: string
  title?: string
  description?: string
}) {
  const [platform, setPlatform] = React.useState<Platform>("other")

  React.useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const defaultDescription =
    platform === "ios"
      ? "Your account is activated. Install TinaVerify on your iPhone or iPad to verify receipts."
      : platform === "android"
        ? "Your account is activated. Install TinaVerify on your Android device to verify receipts."
        : "Your account is activated. Install TinaVerify on your phone to verify receipts."

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-6 text-center",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">
          {description ?? defaultDescription}
        </p>
      </div>
      <StoreBadges className="justify-center" />
    </div>
  )
}
