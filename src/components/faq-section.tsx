"use client"

import { Plus, X } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { Reveal } from "@/components/motion/reveal"
import { siteConfig } from "@/lib/brand"

const faqs = [
	{
		q: "What is ICare MC?",
		a: "ICare MC is a mother and child health companion app. It helps you track pregnancy weeks, monitor child growth, get vaccination reminders, read daily tips, subscribe for premium content, and book appointments with verified doctors.",
	},
	{
		q: "Can I track my child's growth?",
		a: "Yes. Add your child to the app and log growth measurements and milestones so you can follow development over time.",
	},
	{
		q: "Does ICare MC require a subscription?",
		a: "The app is free to download. An optional in-app subscription unlocks the full week-by-week guide, daily health tips, and premium content. Doctor appointments are booked separately with individual consultation fees.",
	},
	{
		q: "Does the app remind me about vaccinations?",
		a: "Yes. ICare MC helps you stay on schedule with vaccination reminders for upcoming immunizations.",
	},
	{
		q: "Which languages are supported?",
		a: "The app supports English, Amharic, and Oromo so you can use ICare MC in the language you prefer.",
	},
	{
		q: "Is ICare MC free to download?",
		a: "Yes. Download the app for free and create your account to start tracking pregnancy, growth, and vaccinations. Premium content is available through an optional subscription.",
	},
	{
		q: "Can I book doctors in the app?",
		a: "Yes. Browse verified doctors, view services and fees, book appointments, and message your doctor after booking.",
	},
	{
		q: "Who is ICare MC for?",
		a: "ICare MC is designed for expectant mothers, new parents, and caregivers who want clear pregnancy and child health guidance, plus easier access to care.",
	},
] as const

export function FaqSection() {
	return (
		<section id="faq" className="relative scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
				<Reveal className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
						FAQ
					</h2>
					<p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
						Common questions about {siteConfig.name} for mothers and caregivers.
					</p>
				</Reveal>

				<AccordionPrimitive.Root
					type="single"
					collapsible
					defaultValue={faqs[0].q}
					className="mt-10 flex flex-col gap-3 sm:gap-4"
				>
					{faqs.map((item, index) => (
						<Reveal key={item.q} delay={0.04 * (index + 1)}>
							<AccordionPrimitive.Item
								value={item.q}
								className="overflow-hidden rounded-2xl border border-border bg-card"
							>
								<AccordionPrimitive.Header>
									<AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left outline-none sm:px-6 sm:py-6">
										<span className="text-base font-semibold text-foreground sm:text-lg">
											{item.q}
										</span>
										<Plus
											className="size-5 shrink-0 text-primary group-data-[state=open]:hidden"
											aria-hidden="true"
										/>
										<X
											className="hidden size-5 shrink-0 text-primary group-data-[state=open]:block"
											aria-hidden="true"
										/>
									</AccordionPrimitive.Trigger>
								</AccordionPrimitive.Header>
								<AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
									<p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 sm:text-base">
										{item.a}
									</p>
								</AccordionPrimitive.Content>
							</AccordionPrimitive.Item>
						</Reveal>
					))}
				</AccordionPrimitive.Root>
			</div>
		</section>
	)
}
