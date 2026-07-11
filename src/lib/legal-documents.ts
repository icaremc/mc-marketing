import {
  bundledSectionsFor,
  type LegalDocumentSlug,
  type LegalSection,
} from "@/lib/legal-content"
import { getSupabase } from "@/lib/supabase"

export async function fetchLegalSections(
  slug: LegalDocumentSlug,
): Promise<LegalSection[]> {
  const bundled = bundledSectionsFor(slug)
  const supabase = getSupabase()
  if (!supabase) return bundled

  try {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("sections, title")
      .eq("slug", slug)
      .maybeSingle()

    if (error || !data) return bundled

    const raw = data.sections
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
  } catch {
    return bundled
  }
}
