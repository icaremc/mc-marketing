import { AppTopBar } from "@/components/app/app-top-bar"
import { ChatComposer } from "@/components/app/chat-composer"
import { StackBackButton } from "@/components/app/stack-back-button"
import { fetchMessages } from "@/lib/api/chat"
import { fetchPatientProfile } from "@/lib/api/profile"

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const profile = await fetchPatientProfile()
  const messages = await fetchMessages("patient", conversationId, profile?.id)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppTopBar
        title="Chat"
        leading={<StackBackButton fallbackHref="/app/messages" />}
      />
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                msg.mine
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p>{msg.body}</p>
              {msg.createdAt ? (
                <p className={`mt-1 text-[10px] ${msg.mine ? "opacity-80" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
      <ChatComposer conversationId={conversationId} role="patient" />
    </div>
  )
}
