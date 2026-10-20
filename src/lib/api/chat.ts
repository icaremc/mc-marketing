import { authedFetch } from "@/lib/api/authed"
import { listFromBody, str } from "@/lib/api/list"
import { objectFrom } from "@/lib/api/parse"

export type Conversation = {
  id: string
  title: string
  preview: string
  updatedAt: string
  unread: number
}

export type ChatMessage = {
  id: string
  body: string
  senderId: string
  createdAt: string
  mine: boolean
}

function parseConversation(row: Record<string, unknown>): Conversation | null {
  const id = str(row, "id")
  if (!id) return null
  const doctor = objectFrom(row.doctor) ?? objectFrom(row.peer) ?? {}
  const patient = objectFrom(row.patient) ?? {}
  const title =
    str(doctor, "full_name") ||
    str(doctor, "name") ||
    str(patient, "full_name") ||
    str(row, "title") ||
    "Chat"
  const last =
    objectFrom(row.last_message) ?? objectFrom(row.latest_message) ?? {}
  return {
    id,
    title,
    preview: str(last, "body") || str(row, "preview") || "",
    updatedAt: str(row, "updated_at") || str(last, "created_at"),
    unread: Number(row.unread_count ?? row.unread ?? 0) || 0,
  }
}

export async function fetchConversations(role: "patient" | "doctor") {
  const path =
    role === "doctor" ? "/doctor/chat/conversations" : "/chat/conversations"
  const result = await authedFetch(path)
  if (!result.ok) return [] as Conversation[]
  return listFromBody(result.data, "conversations")
    .map(parseConversation)
    .filter((c): c is Conversation => !!c)
}

export async function fetchMessages(
  role: "patient" | "doctor",
  conversationId: string,
  myUserId?: string | null,
) {
  const base =
    role === "doctor" ? "/doctor/chat/conversations" : "/chat/conversations"
  const result = await authedFetch(`${base}/${conversationId}/messages`)
  if (!result.ok) return [] as ChatMessage[]
  return listFromBody(result.data, "messages").map((row) => {
    const senderId = str(row, "sender_id") || str(row, "user_id")
    return {
      id: str(row, "id"),
      body: str(row, "body") || str(row, "text") || str(row, "content"),
      senderId,
      createdAt: str(row, "created_at"),
      mine: myUserId ? senderId === myUserId : row.is_mine === true,
    }
  })
}
