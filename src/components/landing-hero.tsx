import Image from "next/image"
import Link from "next/link"
import { BabyIcon, HeartPulseIcon, LanguagesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { StoreBadges } from "@/components/store-badges"
import { siteConfig } from "@/lib/brand"
import { cn } from "@/lib/utils"

const highlights = [
	{ label: "Pregnancy tracking", Icon: BabyIcon },
	{ label: "Doctor booking", Icon: HeartPulseIcon },
	{ label: "English · Amharic · Oromo", Icon: LanguagesIcon },
] as const

export function LandingHero() {
	return (
		<div className="overflow-x-hidden">
			<div className="relative overflow-hidden bg-[linear-gradient(180deg,oklch(0.97_0.02_160)_0%,var(--background)_55%)]">
				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(76,175,138,0.12)_1px,transparent_1px)] [background-size:24px_24px]"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
				/>

				<div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
					<div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
						<div>
							<Reveal>
								<p className="text-sm font-medium text-primary">
									{siteConfig.taglineAm} · {siteConfig.tagline}
								</p>
								<h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
									Your pregnancy companion,{" "}
									<span className="text-primary">week by week.</span>
								</h1>
								<p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
									{siteConfig.name} helps mothers and caregivers track pregnancy
									weeks, daily health tips, appointments, and doctor visits — in
									the languages you use every day.
								</p>
							</Reveal>

							<Reveal delay={0.05} className="mt-8 flex flex-wrap gap-3">
								<Button asChild size="lg" className="rounded-full px-8">
									<Link href="#download">Download the app</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="rounded-full px-8"
								>
									<Link href="#how-it-works">See how it works</Link>
								</Button>
							</Reveal>

							<Reveal delay={0.08} className="mt-8 flex flex-wrap gap-3">
								{highlights.map(({ label, Icon }) => (
									<span
										key={label}
										className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-foreground"
									>
										<Icon className="size-4 text-primary" aria-hidden />
										{label}
									</span>
								))}
							</Reveal>
						</div>

						<Reveal delay={0.06} className="relative mx-auto w-full max-w-md lg:max-w-none">
							<div
								aria-hidden
								className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(76,175,138,0.18),transparent_70%)]"
							/>
							<div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-card p-8 shadow-xl shadow-primary/10">
								<div className="flex items-center gap-3">
									<Image
										src="/logo-icon.png"
										alt=""
										width={56}
										height={56}
										priority
										aria-hidden
									/>
									<div>
										<p className="font-heading text-xl font-semibold">
											{siteConfig.name}
										</p>
										<p className="text-sm text-muted-foreground">
											Mother &amp; child health
										</p>
									</div>
								</div>

								<div className="mt-8 space-y-4">
									{[
										"Track your pregnancy week and due date",
										"Read daily tips matched to your stage",
										"Book verified doctors and message your care team",
									].map((item) => (
										<div
											key={item}
											className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm leading-relaxed"
										>
											{item}
										</div>
									))}
								</div>

								<div
									id="download"
									className={cn(
										"mt-8 scroll-mt-28 rounded-2xl bg-primary/10 p-5"
									)}
								>
									<p className="font-medium text-foreground">
										Get {siteConfig.name} on your phone
									</p>
									<p className="mt-1 text-sm text-muted-foreground">
										Free to download. Create your account in the app.
									</p>
									<StoreBadges className="mt-4" />
								</div>
							</div>
						</Reveal>
					</div>
				</div>
			</div>
		</div>
	)
}
