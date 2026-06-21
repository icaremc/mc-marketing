"use client"

import * as React from "react"
import { CopyIcon, Loader2Icon } from "lucide-react"

import type { BranchEditRecord } from "@/components/dashboard/edit-branch-sheet"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { extractTemporaryPassword, type StaffRole } from "@/lib/staff-utils"
import { isValidEthiopianPhone } from "@/lib/register-validation"

const inputClassName =
  "h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type AddEmployeeSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accessToken: string
  businessId: string
  branches: BranchEditRecord[]
  roles: StaffRole[]
  defaultBranchId?: string
  defaultRoleId?: string
  onCreated: () => void
}

export function AddEmployeeSheet({
  open,
  onOpenChange,
  accessToken,
  businessId,
  branches,
  roles,
  defaultBranchId,
  defaultRoleId,
  onCreated,
}: AddEmployeeSheetProps) {
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [branchId, setBranchId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [tempPassword, setTempPassword] = React.useState<{
    phone: string
    password: string
  } | null>(null)

  React.useEffect(() => {
    if (!open) {
      setError(null)
      setTempPassword(null)
      return
    }
    setPhone("")
    setEmail("")
    setUsername("")
    setBranchId(
      defaultBranchId && branches.some((b) => b.id === defaultBranchId)
        ? defaultBranchId
        : (branches[0]?.id ?? "")
    )
    setRoleId(
      defaultRoleId && roles.some((r) => r.id === defaultRoleId)
        ? defaultRoleId
        : (roles[0]?.id ?? "")
    )
  }, [open, defaultBranchId, defaultRoleId, branches, roles])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setError("Phone number is required.")
      return
    }
    if (!isValidEthiopianPhone(trimmedPhone)) {
      setError(
        "Enter a valid Ethiopian phone: 09XXXXXXXX, 07XXXXXXXX, or +2519XXXXXXXX."
      )
      return
    }
    if (!branchId) {
      setError("Select a branch.")
      return
    }
    if (!roleId) {
      setError("Select a role.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const body: Record<string, string> = {
        business_id: businessId,
        phone_number: trimmedPhone,
        branch_id: branchId,
        role_id: roleId,
      }
      const trimmedEmail = email.trim()
      const trimmedUsername = username.trim()
      if (trimmedEmail) body.email = trimmedEmail
      if (trimmedUsername) body.username = trimmedUsername

      const response = await fetch("/api/staff", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      const data = (await response.json()) as Record<string, unknown> & {
        error?: string
      }
      if (!response.ok) {
        throw new Error(data.error?.toString() ?? "Could not create employee.")
      }

      const password = extractTemporaryPassword(data)
      if (password) {
        setTempPassword({ phone: trimmedPhone, password })
      } else {
        onCreated()
        onOpenChange(false)
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create employee."
      )
    } finally {
      setSaving(false)
    }
  }

  function handleDone() {
    setTempPassword(null)
    onCreated()
    onOpenChange(false)
  }

  async function copyPassword() {
    if (!tempPassword) return
    try {
      await navigator.clipboard.writeText(tempPassword.password)
    } catch {
      // ignore
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {tempPassword ? (
          <>
            <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Temporary password</SheetTitle>
              <SheetDescription>
                Share this password with {tempPassword.phone}. They should
                change it after first sign-in.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 px-3 py-3">
                <code className="min-w-0 flex-1 break-all text-sm font-semibold">
                  {tempPassword.password}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={copyPassword}
                  aria-label="Copy password"
                >
                  <CopyIcon className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
            <SheetFooter className="shrink-0 border-t px-6 py-4">
              <Button type="button" className="w-full" onClick={handleDone}>
                Done
              </Button>
            </SheetFooter>
          </>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit}
          >
            <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14">
              <SheetTitle className="text-lg">Add employee</SheetTitle>
              <SheetDescription>
                Create a branch employee account. A temporary password may be
                issued for first sign-in.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Phone number</span>
                  <input
                    required
                    type="tel"
                    className={inputClassName}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+2519XXXXXXXX"
                    disabled={saving}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Branch</span>
                  <select
                    required
                    className={inputClassName}
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    disabled={saving || branches.length === 0}
                  >
                    <option value="" disabled>
                      Select branch
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Role</span>
                  <select
                    required
                    className={inputClassName}
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    disabled={saving || roles.length === 0}
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">
                    Email{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <input
                    type="email"
                    className={inputClassName}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={saving}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">
                    Username{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <input
                    className={inputClassName}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    disabled={saving}
                  />
                </label>

                {branches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add a branch before creating employees.
                  </p>
                ) : null}
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No manager or associate roles found for this business.
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

            <SheetFooter className="shrink-0 gap-2 border-t bg-background px-6 py-4 sm:flex-col">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  saving ||
                  branches.length === 0 ||
                  roles.length === 0 ||
                  !branchId ||
                  !roleId
                }
              >
                {saving ? (
                  <>
                    <Loader2Icon className="animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  "Create employee"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
