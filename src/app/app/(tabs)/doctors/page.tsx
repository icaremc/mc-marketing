import { AppTopBar } from "@/components/app/app-top-bar"
import { DoctorsTab } from "@/components/app/doctors-tab"
import { fetchDoctorCategories, fetchDoctors } from "@/lib/api/doctors"

export default async function DoctorsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const [doctors, categories] = await Promise.all([
    fetchDoctors({ categoryId: params.category, verifiedOnly: true }),
    fetchDoctorCategories(),
  ])

  return (
    <>
      <AppTopBar title="Doctors" />
      <DoctorsTab
        doctors={doctors}
        categories={categories}
        activeCategory={params.category}
      />
    </>
  )
}
