import { FC } from "react"

interface TypingIndicatorProps {}

export const TypingIndicator: FC<TypingIndicatorProps> = () => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className={`size-2 animate-pulse rounded-full bg-zinc-400`}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
} 