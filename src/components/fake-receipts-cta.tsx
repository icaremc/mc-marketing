import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

export function FakeReceiptsCta() {
	return (
		<section className="relative overflow-visible px-4 pb-16 pt-20 sm:px-6 sm:pt-24 md:pb-20 md:pt-28">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(234,179,8,0.14)_1px,transparent_1px)] [background-size:22px_22px]"
			/>

			<div className="mx-auto w-full max-w-[1446px]">
				<Reveal className="overflow-visible">
					<div className="relative overflow-visible rounded-3xl bg-primary md:h-[350px]">
						<div className="relative z-10 flex flex-col justify-center px-6 pt-10 pb-4 sm:px-10 sm:pt-12 md:h-full md:max-w-[870px] md:px-14 md:pl-16 md:py-8 md:pb-8">
							<h2 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
								Stop fake receipts before they cost you.
							</h2>
							<p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-white sm:text-lg">
								Start a free trial and verify receipts with a workflow your
								cashiers will actually use.
							</p>
							<Button
								asChild
								size="lg"
								className="mt-8 w-fit rounded-full bg-zinc-950 px-8 text-white hover:bg-zinc-900"
							>
								<Link href="/register">
									Register Business
									<ArrowRight
										className="ml-2 size-4 text-primary"
										aria-hidden="true"
									/>
								</Link>
							</Button>
						</div>

						{/* Spacer on small screens so copy clears the floated phone */}
						<div
							className="h-[min(360px,72vw)] shrink-0 md:hidden"
							aria-hidden
						/>

						{/* Bottom-flush on all breakpoints; centered on mobile */}
						<div
							className="pointer-events-none absolute bottom-0 left-1/2 z-20 w-[min(220px,78vw)] -translate-x-1/2 md:left-[60.17%] md:w-[260px] md:translate-x-0 lg:w-[276px]"
						>
							<Image
								src="/images/fake_reciepts.png"
								alt="TinaVerify app preview showing a scanned bank receipt ready for verification"
								width={680}
								height={1200}
								className="h-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
							/>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	)
}
