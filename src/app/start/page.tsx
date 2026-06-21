import { redirect } from "next/navigation"

type PageProps = {
  searchParams: Promise<{ from?: string }>
}

export default async function StartPage({ searchParams }: PageProps) {
  const { from } = await searchParams
  const query = from ? `?from=${encodeURIComponent(from)}` : ""
  redirect(`/register${query}`)
}
