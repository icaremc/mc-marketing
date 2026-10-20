import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorMe } from "@/lib/api/doctor-practice"

export default async function DoctorProfileDetailsPage() {
  const me = await fetchDoctorMe()
  const parts = (me?.name ?? "").trim().split(/\s+/)
  const firstName = parts[0] ?? ""
  const lastName = parts.slice(1).join(" ")
  return (
    <>
      <AppTopBar title="Profile details" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="px-4 py-5">
        <ApiForm path="doctor/me" method="PATCH" redirectTo="/doctors/app/profile" submitLabel="Save">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">First name</span>
            <input name="first_name" defaultValue={firstName} className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Last name</span>
            <input name="last_name" defaultValue={lastName} className="h-10 rounded-md border border-input px-3" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Specialty</span>
            <input name="specialty" defaultValue={me?.specialty ?? ""} className="h-10 rounded-md border border-input px-3" />
          </label>
        </ApiForm>
      </div>
    </>
  )
}
