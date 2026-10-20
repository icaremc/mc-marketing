"use client"

import { useMemo, useState } from "react"

export function BmiCalculator() {
  const [kg, setKg] = useState("")
  const [cm, setCm] = useState("")
  const result = useMemo(() => {
    const w = Number(kg)
    const h = Number(cm) / 100
    if (!(w > 0 && h > 0)) return null
    const bmi = w / (h * h)
    let label = "Normal"
    if (bmi < 18.5) label = "Underweight"
    else if (bmi >= 25 && bmi < 30) label = "Overweight"
    else if (bmi >= 30) label = "Obese"
    return { bmi, label }
  }, [kg, cm])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm">
        Weight (kg)
        <input
          type="number"
          inputMode="decimal"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input px-3"
        />
      </label>
      <label className="text-sm">
        Height (cm)
        <input
          type="number"
          inputMode="decimal"
          value={cm}
          onChange={(e) => setCm(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input px-3"
        />
      </label>
      {result ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-2xl font-semibold">{result.bmi.toFixed(1)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result.label}</p>
        </div>
      ) : null}
    </div>
  )
}

export function BpClassifier() {
  const [sys, setSys] = useState("")
  const [dia, setDia] = useState("")
  const result = useMemo(() => {
    const s = Number(sys)
    const d = Number(dia)
    if (!(s > 0 && d > 0)) return null
    if (s >= 180 || d >= 120) return "Hypertensive crisis — seek care"
    if (s >= 140 || d >= 90) return "High (stage 2)"
    if (s >= 130 || d >= 80) return "High (stage 1)"
    if (s >= 120 && d < 80) return "Elevated"
    return "Normal"
  }, [sys, dia])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm">
        Systolic
        <input
          type="number"
          value={sys}
          onChange={(e) => setSys(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input px-3"
        />
      </label>
      <label className="text-sm">
        Diastolic
        <input
          type="number"
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input px-3"
        />
      </label>
      {result ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm font-medium">
          {result}
        </div>
      ) : null}
    </div>
  )
}

export function DueDateCalculator() {
  const [lmp, setLmp] = useState("")
  const result = useMemo(() => {
    if (!lmp) return null
    const start = new Date(lmp)
    if (Number.isNaN(start.getTime())) return null
    const edd = new Date(start)
    edd.setDate(edd.getDate() + 280)
    const days = Math.floor((Date.now() - start.getTime()) / 86_400_000)
    const week = Math.max(1, Math.min(42, Math.floor(days / 7) + 1))
    return { edd, week }
  }, [lmp])

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm">
        Last menstrual period
        <input
          type="date"
          value={lmp}
          onChange={(e) => setLmp(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input px-3"
        />
      </label>
      {result ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Estimated due date</p>
          <p className="mt-1 text-xl font-semibold">
            {result.edd.toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm">Approx. week {result.week}</p>
        </div>
      ) : null}
    </div>
  )
}
