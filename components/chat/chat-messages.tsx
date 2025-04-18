import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { IconRobotFace, IconUser } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { TypingIndicator } from "./typing-indicator"

interface ChatMessagesProps {}

export const ChatMessages: FC<ChatMessagesProps> = () => {
  const { chatMessages, isGenerating } = useContext(ChatbotUIContext)

  const sortedMessages = chatMessages
    .sort((a, b) => a.message.sequence_number - b.message.sequence_number)
    .map((chatMessage, index, array) => {
      const isLast = index === array.length - 1
      return { ...chatMessage, isLast }
    })

  return (
    <div className="flex flex-col gap-6">
      {sortedMessages.map(message => (
        <div
          key={message.message.id}
          className={cn(
            "flex w-full items-start gap-4 px-4",
            message.message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.message.role === "assistant" && (
            <div className={cn("chat-avatar", "chat-avatar-assistant")}>
              <IconRobotFace size={20} className="text-zinc-400" />
            </div>
          )}

          <div
            className={cn(
              "chat-message",
              message.message.role === "assistant"
                ? "chat-message-assistant"
                : "chat-message-user"
            )}
          >
            <div className="whitespace-pre-wrap">{message.message.content}</div>
            <div className="absolute bottom-1 right-2 text-xs text-zinc-400">
              {new Date(message.message.created_at).toLocaleTimeString()}
            </div>
          </div>

          {message.message.role === "user" && (
            <div className={cn("chat-avatar", "chat-avatar-user")}>
              <IconUser size={20} className="text-zinc-400" />
            </div>
          )}

          {message.message.role === "assistant" &&
            isGenerating &&
            message.isLast && (
              <div className="flex items-center gap-4 px-4">
                <div className={cn("chat-avatar", "chat-avatar-assistant")}>
                  <IconRobotFace size={20} className="text-zinc-400" />
                </div>
                <div className="chat-message chat-message-assistant">
                  <TypingIndicator />
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  )
}
