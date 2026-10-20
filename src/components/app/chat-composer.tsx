"use client"

import { ApiForm } from "@/components/app/api-form"

export function ChatComposer({
  conversationId,
  role,
}: {
  conversationId: string
  role: "patient" | "doctor"
}) {
  const base =
    role === "doctor" ? "doctor/chat/conversations" : "chat/conversations"
  return (
    <ApiForm
      path={`${base}/${conversationId}/messages`}
      submitLabel="Send"
      className="flex gap-2 border-t border-border bg-background p-3"
    >
      <input
        name="body"
        required
        placeholder="Write a message…"
        className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
      />
    </ApiForm>
  )
}
