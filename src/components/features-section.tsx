import {
	BabyIcon,
	CalendarHeartIcon,
	HeartPulseIcon,
	LanguagesIcon,
} from "lucide-react"

import { Reveal } from "@/components/motion/reveal"
import { siteConfig } from "@/lib/brand"

const featureCards = [
	{
		title: "Week-by-week guide",
		desc: "See your pregnancy week, due date, and stage-specific guidance as your journey progresses.",
		Icon: BabyIcon,
	},
	{
		title: "Daily health tips",
		desc: "Get tips matched to your pregnancy week so you know what to expect and watch for.",
		Icon: CalendarHeartIcon,
	},
	{
		title: "Doctor booking",
		desc: "Browse verified doctors, book appointments, and message your care team from the app.",
		Icon: HeartPulseIcon,
	},
	{
		title: "Multilingual support",
		desc: "Use ICare MC in English, Amharic, or Oromo — built for families across Ethiopia.",
		Icon: LanguagesIcon,
	},
] as const

function FeatureCard({
	title,
	desc,
	Icon,
	delay,
}: {
	title: string
	desc: string
	Icon: typeof BabyIcon
	delay?: number
}) {
	return (
		<Reveal
			delay={delay}
			className="rounded-2xl border border-primary/20 bg-card p-7 shadow-sm sm:p-8"
		>
			<Icon className="size-8 text-primary" strokeWidth={1.5} aria-hidden="true" />
			<p className="mt-6 text-lg font-semibold leading-snug">{title}</p>
			<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
		</Reveal>
	)
}

export function FeaturesSection() {
	return (
		<section id="features" className="relative scroll-mt-24 bg-muted/40 py-20 sm:py-24">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(76,175,138,0.08)_1px,transparent_1px)] [background-size:24px_24px]"
			/>

			<div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
				<Reveal className="mx-auto max-w-3xl text-center">
					<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						Built for mothers, caregivers, and growing families.
					</h2>
					<p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
						{siteConfig.name} brings pregnancy tracking, health guidance, and
						doctor access together in one calm, easy-to-use app.
					</p>
				</Reveal>

				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
					{featureCards.map((feature, index) => (
						<FeatureCard
							key={feature.title}
							{...feature}
							delay={0.04 * (index + 1)}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
