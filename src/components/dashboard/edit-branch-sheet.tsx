"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export type BranchEditRecord = {
  id: string
  name: string
  address: string
  is_head_quarter: boolean
  is_archived: boolean
}

export function EditBranchSheet({
  branch,
  accessToken,
  open,
  loading,
  onOpenChange,
  onSaved,
}: {
  branch: BranchEditRecord | null
  accessToken: string
  open: boolean
  loading?: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [name, setName] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [isHq, setIsHq] = React.useState(false)
  const [isArchived, setIsArchived] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setError(null)
      setSuccess(null)
      return
    }
    if (!branch) return
    setName(branch.name)
    setAddress(branch.address)
    setIsHq(branch.is_head_quarter)
    setIsArchived(branch.is_archived)
    setError(null)
    setSuccess(null)
  }, [open, branch])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!branch) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Branch name is required.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/branches/${encodeURIComponent(branch.id)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          address: address.trim(),
          is_head_quarter: isHq,
          is_archived: isArchived,
        }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update branch.")
      }
      setSuccess("Branch updated.")
      onSaved()
      window.setTimeout(() => {
        onOpenChange(false)
      }, 400)
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not update branch."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14">
          <SheetTitle className="text-lg">Edit branch</SheetTitle>
          <SheetDescription>
            Update name, address, headquarters flag, or archive status.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 px-6 text-sm text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" aria-hidden />
            Loading branch…
          </div>
        ) : !branch ? (
          <p className="px-6 py-5 text-sm text-muted-foreground">
            Could not load branch details.
          </p>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSave}
          >
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Branch name</span>
                  <input
                    required
                    className={inputClassName}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Address</span>
                  <input
                    className={inputClassName}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bole, Addis Ababa"
                    disabled={saving}
                  />
                </label>

                <Separator />

                <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4">
                  <legend className="px-1 text-sm font-medium">Branch settings</legend>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={isHq}
                      onChange={(e) => setIsHq(e.target.checked)}
                      disabled={saving}
                      className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">Headquarters branch</span>
                      <span className="text-xs text-muted-foreground">
                        Mark as your main business location.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={isArchived}
                      onChange={(e) => setIsArchived(e.target.checked)}
                      disabled={saving}
                      className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">Archived</span>
                      <span className="text-xs text-muted-foreground">
                        Hide this branch from day-to-day use.
                      </span>
                    </span>
                  </label>
                </fieldset>

                {error ? (
                  <p
                    className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                {success ? (
                  <p
                    className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
                    role="status"
                  >
                    {success}
                  </p>
                ) : null}
              </div>
            </div>

            <SheetFooter className="shrink-0 border-t bg-background px-6 py-4">
              <Button
                type="submit"
                disabled={saving || !name.trim()}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2Icon className="animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
