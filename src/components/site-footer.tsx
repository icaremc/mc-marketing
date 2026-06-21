import Link from "next/link"
import type { ReactNode } from "react"

import { siteConfig } from "@/lib/brand"
import { cn } from "@/lib/utils"

const footerLinkClass =
	"w-fit text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"

function FooterLink({
	href,
	children,
	className,
}: {
	href: string
	children: ReactNode
	className?: string
}) {
	return (
		<Link href={href} className={cn(footerLinkClass, className)}>
			{children}
		</Link>
	)
}

export function SiteFooter() {
	return (
		<footer className="border-t border-border">
			<div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
					<div className="flex flex-col gap-3">
						<p className="font-heading text-sm font-medium">{siteConfig.name}</p>
						<p className="text-sm text-muted-foreground">
							{siteConfig.taglineAm} · {siteConfig.tagline}
						</p>
						<p className="text-sm text-muted-foreground">
							{siteConfig.description}
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-sm font-medium">Product</p>
						<FooterLink href="#how-it-works">How it works</FooterLink>
						<FooterLink href="#features">Features</FooterLink>
						<FooterLink href="#download">Download</FooterLink>
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-sm font-medium">Company</p>
						<FooterLink href="/terms">Terms</FooterLink>
						<FooterLink href="/privacy">Privacy</FooterLink>
						<FooterLink href="/contact">Contact</FooterLink>
					</div>

					<div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
						<p className="text-sm font-medium">Support</p>
						<a href={`mailto:${siteConfig.supportEmail}`} className={footerLinkClass}>
							{siteConfig.supportEmail}
						</a>
						<a href={`tel:${siteConfig.supportPhone}`} className={footerLinkClass}>
							{siteConfig.supportPhone}
						</a>
					</div>
				</div>

				<p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
					© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
				</p>
			</div>
		</footer>
	)
}
