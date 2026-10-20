import { AppTopBar } from "@/components/app/app-top-bar"
import { ApiForm } from "@/components/app/api-form"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function OnboardingPage() {
  const profile = await fetchPatientProfile()
  return (
    <>
      <AppTopBar title="Onboarding" leading={<StackBackButton fallbackHref="/app" />} />
      <div className="flex flex-col gap-4 px-4 py-5">
        <p className="text-sm text-muted-foreground">
          Choose what you want to track. You can change this later in settings.
        </p>
        <ApiForm
          path="me/profile"
          method="PATCH"
          redirectTo="/app"
          submitLabel="Continue"
          body={{ onboarding_complete: true }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">I am tracking</legend>
            {[
              ["pregnancy", "Pregnancy"],
              ["baby", "Baby"],
              ["both", "Both"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm">
                <input
                  type="radio"
                  name="user_tracking_type"
                  value={value}
                  defaultChecked={(profile?.userTrackingType ?? "pregnancy") === value}
                  required
                />
                {label}
              </label>
            ))}
          </fieldset>
        </ApiForm>
      </div>
    </>
  )
}
