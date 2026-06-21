import { ExternalLinkIcon, SendIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const TELEGRAM_COMMUNITY_URL = "https://t.me/+vM_b1KnYRL9mMTE0"

type TelegramCommunityLinkProps = {
  variant?: "banner" | "tile" | "header" | "inline"
  className?: string
}

export function TelegramCommunityLink({
  variant = "banner",
  className,
}: TelegramCommunityLinkProps) {
  if (variant === "header") {
    return (
      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-[#229ED9]/40 bg-[#229ED9]/10 px-3 py-1.5 text-sm font-semibold text-[#1d8bc4] transition-colors hover:bg-[#229ED9]/20 dark:text-[#5eb8ea]",
          className
        )}
      >
        <SendIcon className="size-4 shrink-0" aria-hidden />
        <span className="hidden sm:inline">Telegram</span>
      </a>
    )
  }

  if (variant === "inline") {
    return (
      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold text-[#1d8bc4] underline-offset-4 hover:underline dark:text-[#5eb8ea]",
          className
        )}
      >
        <SendIcon className="size-4 shrink-0" aria-hidden />
        Join our Telegram group
      </a>
    )
  }

  if (variant === "tile") {
    return (
      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "group flex items-start gap-3 rounded-2xl border border-[#229ED9]/35 bg-[#229ED9]/8 p-4 transition-colors hover:border-[#229ED9]/55 hover:bg-[#229ED9]/14",
          className
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#229ED9] text-white">
          <SendIcon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-foreground group-hover:text-[#1d8bc4] dark:group-hover:text-[#5eb8ea]">
            Join our Telegram community
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Get updates, ask questions, and connect with other TinaVerify users.
          </span>
        </span>
        <ExternalLinkIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </a>
    )
  }

  return (
    <a
      href={TELEGRAM_COMMUNITY_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl border border-[#229ED9]/40 bg-[#229ED9]/12 px-4 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-[#229ED9]/60 hover:bg-[#229ED9]/20",
        className
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-[#229ED9] text-white">
        <SendIcon className="size-4" aria-hidden />
      </span>
      Join our Telegram — updates &amp; support
    </a>
  )
}
