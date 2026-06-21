import { NextResponse } from "next/server"

import { getBearerToken } from "@/lib/api-auth"
import { isUuid } from "@/lib/uuid"

export function requireBearer(request: Request): string | NextResponse {
  const token = getBearerToken(request)
  if (!token) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 })
  }
  return token
}

export function requireBusinessId(
  request: Request,
  bodyBusinessId?: string
): string | NextResponse {
  const url = new URL(request.url)
  const businessId =
    bodyBusinessId?.trim() ||
    url.searchParams.get("business_id")?.trim() ||
    ""
  if (!businessId) {
    return NextResponse.json(
      { error: "business_id is required." },
      { status: 400 }
    )
  }
  if (!isUuid(businessId)) {
    return NextResponse.json({ error: "Invalid business_id." }, { status: 400 })
  }
  return businessId
}
