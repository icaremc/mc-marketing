import { Reveal } from "@/components/motion/reveal"

const steps = [
	{
		label: "Step 01",
		title: "Download",
		desc: "Install ICare MC on your phone and choose English, Amharic, or Oromo.",
	},
	{
		label: "Step 02",
		title: "Set your dates",
		desc: "Add your due date or last menstrual period to start your week-by-week guide.",
	},
	{
		label: "Step 03",
		title: "Track & grow",
		desc: "Follow pregnancy weeks, child growth, vaccination reminders, and daily tips in one place.",
	},
	{
		label: "Step 04",
		title: "Book care",
		desc: "Find verified doctors, book appointments, and message your care team after booking.",
	},
] as const

export function HowItWorks() {
	return (
		<section
			id="how-it-works"
			className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24"
		>
			<Reveal className="max-w-2xl">
				<h2 className="text-balance text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
					How it works
				</h2>
				<p className="mt-3 text-pretty text-muted-foreground sm:text-lg">
					A simple flow designed for mothers and caregivers, from first download
					to booking your next appointment.
				</p>
			</Reveal>

			<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{steps.map((step, index) => (
					<Reveal
						key={step.label}
						delay={0.04 * (index + 1)}
						className="rounded-3xl border border-border bg-card p-6 shadow-sm"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
							{step.label}
						</p>
						<p className="mt-3 text-lg font-semibold text-foreground">{step.title}</p>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{step.desc}
						</p>
					</Reveal>
				))}
			</div>
		</section>
	)
}
