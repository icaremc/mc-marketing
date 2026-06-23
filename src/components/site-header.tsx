import Image from "next/image"
import Link from "next/link"

import { HeaderActions } from "@/components/header-actions"
import { siteConfig } from "@/lib/brand"
import { cn } from "@/lib/utils"

type HeaderVariant = "home" | "page"

const navClassName =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"

export function SiteHeader({ variant = "page" }: { variant?: HeaderVariant }) {
  const hashPrefix = variant === "home" ? "" : "/"

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3 font-semibold">
          <Image
            src="/logo-icon.png"
            alt={siteConfig.name}
            width={40}
            height={40}
            priority
            className="rounded-xl"
          />
          <span className="font-heading text-lg text-foreground sm:text-xl">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          <Link href={`${hashPrefix}#how-it-works`} className={navClassName}>
            How it works
          </Link>
          <Link href={`${hashPrefix}#features`} className={navClassName}>
            Features
          </Link>
          <Link href={`${hashPrefix}#download`} className={navClassName}>
            Download
          </Link>
          <Link href={`${hashPrefix}#faq`} className={navClassName}>
            FAQ
          </Link>
          <Link href="/contact" className={navClassName}>
            Contact
          </Link>
        </nav>

        <HeaderActions />
      </div>
    </header>
  )
}
