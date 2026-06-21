import { NextResponse } from "next/server"

import { apiUrl } from "@/lib/api-backend"
import { parseApiError } from "@/lib/api-errors"
import { normalizePaymentMethodSlug } from "@/lib/payment-methods"
import { requireBearer, requireBusinessId } from "@/lib/route-auth"

export async function POST(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 })
  }

  const paymentMethod = normalizePaymentMethodSlug(
    formData.get("payment_method")?.toString() ?? ""
  )
  const file = formData.get("file")
  const businessId =
    formData.get("business_id")?.toString().trim() ||
    new URL(request.url).searchParams.get("business_id")?.trim() ||
    ""

  if (!paymentMethod) {
    return NextResponse.json(
      { error: "payment_method is required." },
      { status: 400 }
    )
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Receipt image is required." }, { status: 400 })
  }
  if (!businessId) {
    return NextResponse.json({ error: "business_id is required." }, { status: 400 })
  }

  const phone = formData.get("phone")?.toString().trim()
  const account = formData.get("account")?.toString().trim()

  const upstream = new FormData()
  upstream.append("file", file, file.name || "receipt.jpg")
  upstream.append("business_id", businessId)
  if (phone) upstream.append("phone", phone)
  if (account) upstream.append("account", account)

  const response = await fetch(
    apiUrl(`/api/v1/verify/${encodeURIComponent(paymentMethod)}`),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: upstream,
    }
  )

  const raw = await response.text()
  if (!response.ok) {
    return NextResponse.json(
      { error: parseApiError(response.status, raw) },
      { status: response.status }
    )
  }

  try {
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ message: raw })
  }
}
