import {
  bundledSectionsFor,
  type LegalDocumentSlug,
  type LegalSection,
} from "@/lib/legal-content"
import { backendFetch } from "@/lib/backend"

export async function fetchLegalSections(
  slug: LegalDocumentSlug,
): Promise<LegalSection[]> {
  const bundled = bundledSectionsFor(slug)

  const result = await backendFetch<{
    sections?: unknown
    title?: string
  }>(`/cms/legal/${encodeURIComponent(slug)}`)

  if (!result.ok || !result.data) return bundled

  const raw = result.data.sections
  if (!Array.isArray(raw) || raw.length === 0) return bundled

  const sections: LegalSection[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const title = String((item as { title?: unknown }).title ?? "").trim()
    const body = String((item as { body?: unknown }).body ?? "").trim()
    if (!title && !body) continue
    sections.push({ title, body })
  }
  return sections.length > 0 ? sections : bundled
}
