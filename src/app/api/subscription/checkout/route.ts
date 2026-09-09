import { NextResponse } from "next/server"

import { generateTxRef, initializeChapaPayment } from "@/lib/chapa"
import { authEmailFromPhone, formatChapaPhone } from "@/lib/phone"
import { getSessionTokens } from "@/lib/session"
import { siteConfig } from "@/lib/brand"
import {
  checkoutTotal,
  fetchChapaSettings,
  fetchMembershipSettings,
} from "@/lib/subscription-settings"
import { getSupabaseWithToken } from "@/lib/supabase-admin"

export async function POST() {
  const session = await getSessionTokens()
  if (!session) {
    return NextResponse.json({ error: "Please register or sign in first." }, { status: 401 })
  }

  const userClient = getSupabaseWithToken(session.accessToken)
  if (!userClient) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 })
  }

  const { data: userData, error: userError } = await userClient.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Session expired. Please register again." }, { status: 401 })
  }

  const plan = await fetchMembershipSettings()
  if (!plan.enabled) {
    return NextResponse.json({ error: "Subscriptions are not available right now." }, { status: 400 })
  }

  const chapa = await fetchChapaSettings()
  if (!chapa?.secretKey || !chapa.enable || !chapa.isActive) {
    return NextResponse.json(
      { error: "Payment is not configured. Try again later or use the mobile app." },
      { status: 503 },
    )
  }

  const user = userData.user
  const meta = user.user_metadata ?? {}
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "Member"
  const [firstName, ...rest] = fullName.trim().split(/\s+/)
  const lastName = rest.join(" ") || "iCare"
  const phone =
    (typeof meta.phone === "string" && meta.phone) || user.phone || ""
  const email =
    user.email ||
    (phone ? authEmailFromPhone(phone) : "") ||
    `member+${user.id.slice(0, 8)}@icaremchealth.com`

  const amount = checkoutTotal(plan.yearlyPrice, chapa.feePercent)
  const txRef = generateTxRef(user.id)
  const returnUrl = `${siteConfig.siteUrl}/subscribe/callback?tx_ref=${encodeURIComponent(txRef)}`

  const result = await initializeChapaPayment({
    secretKey: chapa.secretKey,
    amount,
    currency: plan.currency,
    email,
    phone: formatChapaPhone(phone),
    firstName: firstName || "Member",
    lastName,
    txRef,
    returnUrl,
    title: "Yearly plan",
    description: "iCare MC membership",
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    checkoutUrl: result.checkoutUrl,
    txRef: result.txRef,
    amount,
    currency: plan.currency,
  })
}
