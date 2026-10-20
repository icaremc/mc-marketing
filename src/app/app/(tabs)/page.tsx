import Link from "next/link"
import {
  ArrowRight,
  Baby,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  HeartPulse,
  Hospital,
  ListChecks,
  MessageCircle,
  PersonStanding,
  Phone,
  Scale,
  Syringe,
} from "lucide-react"

import { AppTopBar } from "@/components/app/app-top-bar"
import {
  HomeAdviceBox,
  HomeCardHeader,
  HomeMetricRow,
  HomeMilestoneBullet,
  HomeSectionHeader,
  HomeSurfaceCard,
} from "@/components/app/home-surface"
import { buildHomeBabyHealth } from "@/lib/api/home-baby"
import { fetchPatientAppointments } from "@/lib/api/doctor-practice"
import { fetchNotifications } from "@/lib/api/notifications"
import {
  fetchActivePregnancy,
  fetchPregnancyWeeks,
} from "@/lib/api/pregnancy"
import { fetchPatientProfile } from "@/lib/api/profile"

function trimesterLabel(n: number) {
  if (n === 1) return "First trimester"
  if (n === 2) return "Second trimester"
  return "Third trimester"
}

function dueShort(edd: string) {
  const d = new Date(edd)
  if (Number.isNaN(d.getTime())) return edd
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

const TOOLS = [
  {
    href: "/app/tools/calculator",
    title: "EDD",
    subtitle: "Find your due date",
    Icon: CalendarDays,
  },
  {
    href: "/app/tools/calculator",
    title: "Gestational Age",
    subtitle: "Check your weeks",
    Icon: Clock,
  },
  {
    href: "/app/tools/bmi",
    title: "Pregnancy weight-gain tracker",
    subtitle: "Track weight gain with a chart",
    Icon: Scale,
  },
  {
    href: "/app/tools/bp",
    title: "Blood pressure",
    subtitle: "Check BP category & guidance",
    Icon: HeartPulse,
  },
] as const

export default async function PatientHomePage() {
  const [profile, appointments, pregnancy, weeks, baby, notifications] =
    await Promise.all([
      fetchPatientProfile(),
      fetchPatientAppointments(),
      fetchActivePregnancy(),
      fetchPregnancyWeeks(),
      buildHomeBabyHealth(),
      fetchNotifications("patient"),
    ])

  const firstName = profile?.fullName?.split(/\s+/)[0] || "there"
  const tracking = profile?.userTrackingType ?? "pregnancy"
  const showPregnancy =
    pregnancy && (tracking === "pregnancy" || tracking === "both")
  const showBaby =
    (tracking === "baby" || tracking === "both") && !!baby
  const showTools = tracking === "pregnancy" || tracking === "both"
  const showHealthCheckIn = !!showPregnancy
  const showAddBaby =
    (tracking === "pregnancy" || tracking === "both") && !baby

  const week = pregnancy?.weekNumber ?? 1
  const weekCms = weeks.find((w) => w.weekNumber === week)
  const heroImage = weekCms?.imageUrl || ""
  const progress = pregnancy ? Math.min(1, pregnancy.dayNumber / 280) : 0
  const unread = notifications.filter((n) => !n.read).length
  const badge = unread > 9 ? "9+" : unread > 0 ? String(unread) : null

  const nextAppt = appointments.find((a) => {
    const s = a.status.toLowerCase()
    return s !== "cancelled" && s !== "completed"
  })

  return (
    <>
      <AppTopBar
        brand
        title="ICare MC"
        actions={
          <>
            <Link
              href="/app/messages"
              className="inline-flex size-10 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Messages"
            >
              <MessageCircle className="size-5" />
            </Link>
            <Link
              href="/app/notifications"
              className="relative inline-flex size-10 items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {badge ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E05D5D] px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
            </Link>
          </>
        }
      />

      <div className="flex flex-col px-5 pb-6 pt-3">
        {showPregnancy && pregnancy ? (
          <div className="flex flex-col gap-3">
            <Link
              href={`/app/pregnancy/week/${week}`}
              className="relative block h-[360px] overflow-hidden rounded-[10px] border border-primary/25"
            >
              <div className="absolute inset-0 bg-[var(--icare-surface-muted)]" />
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 flex flex-col justify-between p-5 pb-[18px]">
                <div>
                  <p className="text-sm font-semibold text-white/88">Hello,</p>
                  <p className="text-[22px] font-extrabold tracking-tight text-white">
                    {firstName}
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-extrabold tracking-tight text-white">
                    Day {pregnancy.dayNumber}
                  </p>
                  <ArrowRight className="size-[22px] text-white" />
                </div>
              </div>
            </Link>

            <div
              className="relative overflow-hidden rounded-xl border border-white/18 p-[18px]"
              style={{ background: "var(--icare-status-gradient)" }}
            >
              <PersonStanding
                className="pointer-events-none absolute -top-1.5 right-2 size-[108px] text-white/22"
                strokeWidth={1.2}
                aria-hidden
              />
              <p className="relative text-base font-extrabold tracking-tight text-white">
                {pregnancy.weekNumber} weeks, {pregnancy.weekDays}{" "}
                {pregnancy.weekDays === 1 ? "day" : "days"} pregnant
              </p>
              <span className="relative mt-2.5 inline-block rounded-lg border border-white/30 bg-white/18 px-2.5 py-1 text-xs font-bold text-white">
                {trimesterLabel(pregnancy.trimester)}
              </span>
              <div className="relative mt-3.5 flex items-center gap-1.5">
                <CalendarDays className="size-[17px] text-white/90" />
                <p className="flex-1 text-sm font-semibold text-white/92">
                  {pregnancy.edd ? `Due ${dueShort(pregnancy.edd)}` : "Due —"}
                </p>
                <Link
                  href="/app/tools/calculator"
                  className="rounded-full bg-white/16 px-3 py-1.5 text-[13px] font-bold text-white"
                >
                  Edit
                </Link>
              </div>
              <div className="relative mt-4 flex items-center gap-3">
                <div className="relative h-6 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-white/24" />
                  <div
                    className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-white"
                    style={{ width: `${progress * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-black/30"
                    style={{
                      left: `clamp(0px, calc(${progress * 100}% - 10px), calc(100% - 20px))`,
                    }}
                  >
                    <PersonStanding className="size-3.5 text-white" />
                  </div>
                </div>
                <span className="text-xs font-extrabold tracking-wide text-white">
                  {week}/40
                </span>
              </div>
            </div>
          </div>
        ) : profile && !profile.onboardingComplete ? (
          <Link
            href="/app/onboarding"
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
          >
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
              <CalendarDays className="size-5" />
            </span>
            <p className="flex-1 text-sm font-semibold">
              Complete setup to see your pregnancy week
            </p>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ) : null}

        {showAddBaby ? (
          <Link
            href="/app/settings/baby"
            className="mt-8 flex items-center gap-3.5 rounded-xl border border-primary/35 bg-[var(--accent)] p-4"
          >
            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full border border-primary/25 bg-card">
              <Baby className="size-7 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold">Add your baby</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                Add your baby&apos;s profile to track growth, vaccines, and
                milestones.
              </p>
              <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[13px] font-bold text-white">
                Add baby <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ) : null}

        {showBaby && baby ? (
          <div className="mt-8">
            <HomeSectionHeader title="Your child’s health" />
            <div className="flex flex-col gap-2">
              <HomeSurfaceCard
                href="/app/growth"
                tone={baby.needsAttention ? "warning" : "primary"}
                bordered={false}
              >
                <HomeCardHeader icon={Scale} title="Growth for age" />
                {!baby.weight && !baby.height ? (
                  <p className="mt-3.5 text-xs leading-[1.4] text-muted-foreground">
                    Add weight and height to see if growth is on track for age.
                  </p>
                ) : (
                  <div className="mt-3.5 flex flex-col gap-2.5">
                    {baby.weight && baby.weightLabel ? (
                      <HomeMetricRow
                        label="Weight"
                        value={baby.weightLabel}
                        statusLabel={baby.weight.label}
                        concern={baby.weight.isConcern}
                      />
                    ) : null}
                    {baby.height && baby.heightLabel ? (
                      <HomeMetricRow
                        label="Height"
                        value={baby.heightLabel}
                        statusLabel={baby.height.label}
                        concern={baby.height.isConcern}
                      />
                    ) : null}
                    {baby.advice.length > 0 ? (
                      <HomeAdviceBox items={baby.advice} />
                    ) : !baby.needsAttention ? (
                      <p className="mt-2.5 text-xs font-semibold leading-[1.35] text-[var(--icare-primary-dark)] dark:text-primary">
                        Weight and height look appropriate for age. Keep up
                        regular checkups.
                      </p>
                    ) : null}
                  </div>
                )}
              </HomeSurfaceCard>

              <HomeSurfaceCard
                href="/app/baby/milestones"
                tone={baby.milestones.hasMissed ? "warning" : "primary"}
                bordered={false}
              >
                <HomeCardHeader
                  icon={ListChecks}
                  title="Developmental milestones"
                />
                {baby.milestones.hasMissed && baby.milestones.alertText ? (
                  <>
                    <p className="mt-2.5 text-sm font-bold leading-[1.35] text-foreground">
                      {baby.milestones.alertText}
                    </p>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {baby.milestones.bullets.map((item) => (
                        <HomeMilestoneBullet key={item} text={item} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mt-2.5 text-xs leading-[1.4] text-muted-foreground">
                    {baby.milestones.emptyText}
                  </p>
                )}
              </HomeSurfaceCard>

              {baby.vaccines.show ? (
                <HomeSurfaceCard
                  href="/app/baby/vaccines"
                  tone={baby.vaccines.urgent ? "warning" : "primary"}
                  bordered={false}
                >
                  <HomeCardHeader
                    icon={Syringe}
                    title="Vaccination reminders"
                  />
                  <p className="mt-3 text-sm font-semibold leading-[1.35] text-[#E08A00]">
                    {baby.vaccines.title}
                  </p>
                  {baby.vaccines.names ? (
                    <p className="mt-1 text-xs leading-[1.35] text-muted-foreground">
                      {baby.vaccines.names}
                    </p>
                  ) : null}
                </HomeSurfaceCard>
              ) : null}
            </div>
          </div>
        ) : null}

        {showTools ? (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">Tracking tools</h2>
              <Link href="/app/tools" className="px-2 text-sm font-semibold">
                See all
              </Link>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="flex min-h-[118px] flex-col rounded-xl bg-card px-3.5 pb-3 pt-3.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                    <tool.Icon className="size-4" />
                  </span>
                  <p className="mt-2.5 truncate text-sm font-bold leading-tight">
                    {tool.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-snug text-muted-foreground">
                    {tool.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="text-base font-bold">Need doctor advice?</h2>
          <div className="mt-2.5">
            {nextAppt ? (
              <Link
                href="/app/appointments"
                className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                  <CalendarDays className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{nextAppt.patientName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {nextAppt.serviceName}
                  </p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    {nextAppt.scheduledAt}
                  </p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            ) : (
              <Link
                href="/app/doctors"
                className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                  <CalendarDays className="size-5" />
                </span>
                <p className="flex-1 text-sm font-bold text-[var(--icare-primary-dark)] dark:text-primary">
                  Book a visit now
                </p>
                <ChevronRight className="size-5 text-primary/70" />
              </Link>
            )}
          </div>
        </div>

        {showHealthCheckIn && pregnancy ? (
          <div className="mt-8">
            <h2 className="text-base font-bold">Health check-in</h2>
            <Link
              href="/app/health"
              className="mt-2.5 flex items-center gap-3 rounded-xl bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  Weight, blood pressure & symptoms
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Log for pregnancy week {week}
                </p>
              </div>
              <span className="text-sm font-bold text-primary dark:text-foreground">
                Log today
              </span>
            </Link>
          </div>
        ) : null}

        <div className="mt-8">
          <h2 className="text-base font-bold">Safety & emergency</h2>
          <div className="mt-2.5 flex gap-2">
            <a
              href="tel:911"
              className="flex flex-1 items-center gap-2 rounded-xl bg-[var(--icare-danger-card)] px-3 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#E05D5D]/20 text-[#D64545]">
                <Phone className="size-5" />
              </span>
              <span className="text-sm font-bold text-[#D64545]">
                Call emergency
              </span>
              <ChevronRight className="ml-auto size-5 text-[#D64545]/70" />
            </a>
            <Link
              href="/app/doctors"
              className="flex flex-1 items-center gap-2 rounded-xl bg-card px-3 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
                <Hospital className="size-5" />
              </span>
              <span className="text-sm font-bold text-[var(--icare-primary-dark)] dark:text-primary">
                Health facility
              </span>
              <ChevronRight className="ml-auto size-5 text-primary/70" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
