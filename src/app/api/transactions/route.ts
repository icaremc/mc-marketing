import { NextResponse } from "next/server"

import { requireBearer, requireBusinessId } from "@/lib/route-auth"
import {
  defaultDateRange,
  listBusinessTransactions,
} from "@/lib/transactions-api"

export async function GET(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  const businessId = requireBusinessId(request)
  if (businessId instanceof NextResponse) return businessId

  const url = new URL(request.url)
  const defaults = defaultDateRange()
  const startDate = url.searchParams.get("start_date") ?? defaults.start
  const endDate = url.searchParams.get("end_date") ?? defaults.end
  const createdBy = url.searchParams.get("created_by") ?? undefined

  try {
    const transactions = await listBusinessTransactions(token, businessId, {
      startDate,
      endDate,
      createdBy,
    })
    return NextResponse.json({ transactions })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load transactions."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
