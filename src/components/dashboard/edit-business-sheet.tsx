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

export type BusinessEditRecord = {
  id: string
  name: string
  tin_number: string
  is_active: boolean
  is_archived: boolean
}

export function EditBusinessSheet({
  business,
  accessToken,
  open,
  onOpenChange,
  onSaved,
}: {
  business: BusinessEditRecord | null
  accessToken: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: { name: string; tin_number: string }) => void
}) {
  const [name, setName] = React.useState("")
  const [tin, setTin] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [nameTinReadOnly, setNameTinReadOnly] = React.useState(false)

  React.useEffect(() => {
    if (!business) return
    setName(business.name)
    setTin(business.tin_number)
    setIsActive(business.is_active)
    setError(null)
    setNameTinReadOnly(false)
  }, [business])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!business) return
    setSaving(true)
    setError(null)

    const trimmedName = name.trim()
    const trimmedTin = tin.trim()

    try {
      let detailsUpdated = false

      if (
        trimmedName !== business.name.trim() ||
        trimmedTin !== business.tin_number.trim()
      ) {
        const putResponse = await fetch(
          `/api/businesses/${encodeURIComponent(business.id)}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: trimmedName,
              tin_number: trimmedTin,
            }),
          }
        )
        const putData = (await putResponse.json()) as { error?: string }
        if (!putResponse.ok) {
          if (putResponse.status === 404 || putResponse.status === 405) {
            setNameTinReadOnly(true)
            throw new Error(
              "Name and TIN cannot be changed on the server yet. You can still update active status below."
            )
          }
          throw new Error(putData.error ?? "Could not update business details.")
        }
        detailsUpdated = true
      }

      if (isActive !== business.is_active) {
        const patchResponse = await fetch(
          `/api/businesses/${encodeURIComponent(business.id)}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_active: isActive }),
          }
        )
        const patchData = (await patchResponse.json()) as { error?: string }
        if (!patchResponse.ok) {
          throw new Error(patchData.error ?? "Could not update business status.")
        }
      }

      if (detailsUpdated || isActive !== business.is_active) {
        onSaved({ name: trimmedName, tin_number: trimmedTin })
        onOpenChange(false)
      } else {
        onOpenChange(false)
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update business."
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
          <SheetTitle className="text-lg">Edit business</SheetTitle>
          <SheetDescription>
            Update your business name, TIN, and whether the business is active.
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSave}>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">Business name</span>
                <input
                  required
                  className={inputClassName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving || nameTinReadOnly}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">TIN number</span>
                <input
                  required
                  className={inputClassName}
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  disabled={saving || nameTinReadOnly}
                />
              </label>

              <Separator />

              <fieldset className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4">
                <legend className="px-1 text-sm font-medium">Status</legend>
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={saving}
                    className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">Business is active</span>
                    <span className="text-xs text-muted-foreground">
                      Inactive businesses cannot process new verifications.
                    </span>
                  </span>
                </label>
              </fieldset>

              {business?.is_archived ? (
                <p className="rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  This business is archived. Contact support if you need it
                  restored.
                </p>
              ) : null}
              {error ? (
                <p
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t bg-background px-6 py-4">
            <Button
              type="submit"
              disabled={saving || !name.trim() || !tin.trim()}
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
      </SheetContent>
    </Sheet>
  )
}
