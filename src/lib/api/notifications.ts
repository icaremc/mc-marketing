import { authedFetch } from "@/lib/api/authed"
import { listFromBody, str } from "@/lib/api/list"

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export async function fetchNotifications(role: "patient" | "doctor") {
  const path = role === "doctor" ? "/doctor/notifications" : "/notifications"
  const result = await authedFetch(path)
  if (!result.ok) return [] as AppNotification[]
  return listFromBody(result.data, "notifications").map((row) => ({
    id: str(row, "id"),
    title: str(row, "title") || str(row, "subject") || "Notification",
    body: str(row, "body") || str(row, "message") || str(row, "content"),
    createdAt: str(row, "created_at"),
    read: row.is_read === true || row.read === true || row.read_at != null,
  }))
}
