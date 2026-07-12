import Image from "next/image"

import { Reveal } from "@/components/motion/reveal"
import { StoreBadges } from "@/components/store-badges"
import { siteConfig } from "@/lib/brand"

export function DownloadAppCta() {
	return (
		<section id="download" className="scroll-mt-24 px-4 pb-16 pt-8 sm:px-6 sm:pb-20">
			<div className="mx-auto w-full max-w-6xl">
				<Reveal>
					<div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
						<div className="grid items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-14 lg:py-12">
							<div>
								<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
									Start your journey with {siteConfig.name}.
								</h2>
								<p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
									Download the app to track pregnancy, child growth, and
									vaccination reminders, from early weeks through growing up.
								</p>
								<StoreBadges className="mt-8" />
							</div>

							<div className="mx-auto flex items-center justify-center lg:mx-0">
								<Image
									src="/logo-icon.png"
									alt={`${siteConfig.name} app logo`}
									width={220}
									height={220}
									className="h-auto w-[180px] rounded-[2.5rem] drop-shadow-lg sm:w-[220px]"
								/>
							</div>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	)
}
