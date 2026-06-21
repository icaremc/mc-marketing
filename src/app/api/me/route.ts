import { NextResponse } from "next/server"

import { requireBearer } from "@/lib/route-auth"
import { fetchMeProfile, fetchUserBranch } from "@/lib/user-profile"
import { fetchUserBusinesses } from "@/lib/auth-login"

export async function GET(request: Request) {
  const token = requireBearer(request)
  if (token instanceof NextResponse) return token

  try {
    const [profile, businesses, branch] = await Promise.all([
      fetchMeProfile(token),
      fetchUserBusinesses(token),
      fetchUserBranch(token),
    ])
    return NextResponse.json({ profile, businesses, branch })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load profile."
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
