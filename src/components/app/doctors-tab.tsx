"use client"

import Link from "next/link"
import { useState } from "react"
import { MessageCircle, Search, Star } from "lucide-react"

import { cn } from "@/lib/utils"

type Doctor = {
  id: string
  name: string
  specialty: string
  hospital: string
  avatarUrl: string
  rating: number | null
  verified: boolean
}

type Category = { id: string; name: string }

const SEGMENTS = ["Find", "Appointments", "Chat"] as const

export function DoctorsTab({
  doctors,
  categories,
  activeCategory,
  appointmentsHref = "/app/appointments",
  messagesHref = "/app/messages",
}: {
  doctors: Doctor[]
  categories: Category[]
  activeCategory?: string
  appointmentsHref?: string
  messagesHref?: string
}) {
  const [segment, setSegment] =
    useState<(typeof SEGMENTS)[number]>("Find")
  const [query, setQuery] = useState("")

  const filtered = doctors.filter((d) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col px-5 pb-6 pt-2">
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {SEGMENTS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSegment(item)}
            className={cn(
              "h-9 rounded-lg text-sm font-semibold transition",
              segment === item
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {segment === "Find" ? (
        <>
          <label className="mb-3 flex h-11 items-center gap-2 rounded-full bg-card px-4 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors"
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="app-scroll -mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1">
            <Link
              href="/app/doctors"
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                !activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/app/doctors?category=${encodeURIComponent(category.id)}`}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No doctors found.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/app/doctors/${doctor.id}`}
                  className="flex flex-col rounded-xl bg-card p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                >
                  <div className="mx-auto flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {doctor.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doctor.avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      doctor.name.slice(0, 1)
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-center text-sm font-bold">
                    {doctor.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-center text-[11px] text-muted-foreground">
                    {doctor.specialty || "Doctor"}
                  </p>
                  {doctor.rating != null ? (
                    <p className="mt-1 flex items-center justify-center gap-0.5 text-[11px] font-semibold text-primary">
                      <Star className="size-3 fill-current" />
                      {doctor.rating.toFixed(1)}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : null}

      {segment === "Appointments" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            View and manage booked visits with your doctors.
          </p>
          <Link
            href={appointmentsHref}
            className="flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
          >
            Open appointments
          </Link>
        </div>
      ) : null}

      {segment === "Chat" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Message your care team about visits and follow-ups.
          </p>
          <Link
            href={messagesHref}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground"
          >
            <MessageCircle className="size-4" />
            Open messages
          </Link>
        </div>
      ) : null}
    </div>
  )
}
