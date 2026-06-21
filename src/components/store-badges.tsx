import Image from "next/image"

import { siteConfig } from "@/lib/brand"
import { cn } from "@/lib/utils"

const GOOGLE_PLAY_BADGE = "/images/Google Play.png"
const APP_STORE_BADGE = "/images/App Store.png"

const BADGE_WIDTH = 208
const BADGE_HEIGHT = 61

export function StoreBadges({
	className,
	badgeClassName,
}: {
	className?: string
	badgeClassName?: string
}) {
	const badgeImageClassName =
		badgeClassName ??
		"h-[46px] w-auto shrink-0 transition-opacity hover:opacity-90 sm:h-[50px]"

	return (
		<div className={cn("flex flex-wrap items-center gap-3 sm:gap-4", className)}>
			<a
				href={siteConfig.playStoreUrl}
				target="_blank"
				rel="noreferrer"
				aria-label="Get it on Google Play"
				className="inline-flex shrink-0"
			>
				<Image
					src={GOOGLE_PLAY_BADGE}
					alt="Get it on Google Play"
					width={BADGE_WIDTH}
					height={BADGE_HEIGHT}
					className={badgeImageClassName}
				/>
			</a>

			<a
				href={siteConfig.appStoreUrl}
				target="_blank"
				rel="noreferrer"
				aria-label="Download on the App Store"
				className="inline-flex shrink-0"
			>
				<Image
					src={APP_STORE_BADGE}
					alt="Download on the App Store"
					width={BADGE_WIDTH}
					height={BADGE_HEIGHT}
					className={badgeImageClassName}
				/>
			</a>
		</div>
	)
}
