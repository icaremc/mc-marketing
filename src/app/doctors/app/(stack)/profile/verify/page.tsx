import { AppTopBar } from "@/components/app/app-top-bar"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchDoctorMe } from "@/lib/api/doctor-practice"

export default async function DoctorVerifyPage() {
  const me = await fetchDoctorMe()
  return (
    <>
      <AppTopBar title="Verification" leading={<StackBackButton fallbackHref="/doctors/app/profile" />} />
      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="rounded-2xl border border-border bg-card px-4 py-4">
          <p className="text-sm font-semibold">
            {me?.verified ? "Verified" : "Pending verification"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {me?.verified
              ? "Your credentials are verified. Patients can book you with confidence."
              : "Our team reviews license and ID documents submitted during registration. Contact support if this takes longer than expected."}
          </p>
        </div>
      </div>
    </>
  )
}
