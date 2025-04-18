import { ChatbotUIContext } from "@/context/context"
import { getUserChats } from "@/db/chats"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { IconMessage } from "@tabler/icons-react"
import { FC, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ChatHistoryProps {}

export const ChatHistory: FC<ChatHistoryProps> = () => {
  const { profile } = useContext(ChatbotUIContext)
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchChats = async () => {
      if (!profile?.user_id) return

      try {
        const userChats = await getUserChats(profile.user_id)
        setChats(userChats)
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [profile?.user_id])

  if (loading) {
    return (
      <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-zinc-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">Chat History</h2>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <p>No previous chats</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => router.push(`/chat/${chat.id}`)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors",
                  "hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none"
                )}
              >
                <IconMessage size={20} className="text-zinc-400" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm text-zinc-200">{chat.name}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
