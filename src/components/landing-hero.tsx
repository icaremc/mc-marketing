"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { siteConfig } from "@/lib/brand"

export function LandingHero() {
	const reduce = useReducedMotion()

	return (
		<section className="relative overflow-hidden bg-[#0b1214]">
			{/* Soft atmosphere on the copy side */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full bg-[radial-gradient(ellipse_at_20%_30%,rgba(76,175,138,0.28),transparent_55%),linear-gradient(90deg,#0b1214_0%,#0b1214_42%,rgba(11,18,20,0.55)_62%,transparent_78%)] lg:w-[70%]"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-24 left-1/4 z-[1] h-64 w-64 rounded-full bg-primary/20 blur-3xl"
			/>

			<div className="relative mx-auto grid min-h-[min(92vh,880px)] w-full max-w-[1400px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
				{/* Copy */}
				<div className="relative z-10 flex flex-col justify-center px-4 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:pl-16">
					<Reveal>
						<p className="font-heading text-sm font-medium tracking-[0.18em] text-primary uppercase">
							{siteConfig.taglineAm}
						</p>
						<p className="mt-3 font-heading text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
							{siteConfig.name}
						</p>
						<h1 className="mt-5 max-w-xl text-balance text-2xl font-medium leading-snug text-white/90 sm:text-3xl lg:text-4xl">
							Your pregnancy companion,{" "}
							<span className="text-primary">week by week.</span>
						</h1>
						<p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
							Track pregnancy, child growth, and vaccination reminders, plus
							doctor visits in English, Amharic, and Oromo.
						</p>
					</Reveal>

					<Reveal delay={0.08} className="mt-9 flex flex-wrap gap-3">
						<Button
							asChild
							size="lg"
							className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
						>
							<Link href="#download">Download the app</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="rounded-full border-white/25 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
						>
							<Link href="#how-it-works">See how it works</Link>
						</Button>
					</Reveal>

					<Reveal delay={0.14} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
						<span>Pregnancy tracking</span>
						<span className="hidden text-white/25 sm:inline" aria-hidden>
							|
						</span>
						<span>Child growth</span>
						<span className="hidden text-white/25 sm:inline" aria-hidden>
							|
						</span>
						<span>Vaccination reminders</span>
					</Reveal>
				</div>

				{/* Hero portrait — edge-to-edge on large screens */}
				<div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-full">
					<motion.div
						className="absolute inset-0"
						initial={reduce ? false : { opacity: 0, scale: 1.04 }}
						animate={reduce ? undefined : { opacity: 1, scale: 1 }}
						transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
					>
						<Image
							src="/images/hero-image.png"
							alt={`${siteConfig.name} care professional`}
							fill
							priority
							sizes="(max-width: 1024px) 100vw, 50vw"
							className="object-cover object-[center_18%] lg:object-[center_12%]"
						/>
					</motion.div>

					{/* Blend into copy on mobile/tablet */}
					<div
						aria-hidden
						className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0b1214] to-transparent lg:hidden"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#0b1214] to-transparent lg:block"
					/>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b1214]/40 to-transparent lg:h-32"
					/>
				</div>
			</div>
		</section>
	)
}
