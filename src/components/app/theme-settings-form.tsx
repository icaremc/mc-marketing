"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, type FormEvent } from "react"

export function ThemeSettingsForm({ darkMode }: { darkMode: boolean }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const [value, setValue] = useState(darkMode ? "true" : "false")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const dark = value === "true"
    setTheme(dark ? "dark" : "light")
    try {
      const response = await fetch("/api/backend/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dark_mode: dark }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        setError(data?.error || "Could not save theme.")
        setPending(false)
        return
      }
      router.push("/app/settings")
      router.refresh()
    } catch {
      setError("Network error.")
    }
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Appearance</span>
        <select
          value={value}
          onChange={(e) => {
            const next = e.target.value
            setValue(next)
            setTheme(next === "true" ? "dark" : "light")
          }}
          className="h-10 rounded-md border border-input bg-background px-3"
        >
          <option value="false">Light</option>
          <option value="true">Dark</option>
        </select>
      </label>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  )
}
