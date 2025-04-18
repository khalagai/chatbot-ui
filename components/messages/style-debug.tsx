import { FC, useEffect, useState } from "react"

interface StyleDebugProps {
  targetId: string
}

interface StyleInfo {
  backgroundColor: string
  color: string
  padding: string
  margin: string
  borderRadius: string
  maxWidth: string
  classes: string
}

export const StyleDebug: FC<StyleDebugProps> = ({ targetId }) => {
  const [styleInfo, setStyleInfo] = useState<StyleInfo | null>(null)

  useEffect(() => {
    const updateStyles = () => {
      const element = document.querySelector(`[data-message-id="${targetId}"]`)
      if (element) {
        const computedStyle = window.getComputedStyle(element)
        setStyleInfo({
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          padding: computedStyle.padding,
          margin: computedStyle.margin,
          borderRadius: computedStyle.borderRadius,
          maxWidth: computedStyle.maxWidth,
          classes: element.className
        })
      }
    }

    // Update initially
    updateStyles()

    // Set up mutation observer to track style changes
    const observer = new MutationObserver(updateStyles)
    const element = document.querySelector(`[data-message-id="${targetId}"]`)

    if (element) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class", "style"]
      })
    }

    return () => observer.disconnect()
  }, [targetId])

  if (!styleInfo) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "1rem",
        borderRadius: "0.5rem",
        zIndex: 9999,
        maxWidth: "400px",
        fontSize: "12px"
      }}
    >
      <h3>Style Debug: {targetId}</h3>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
        {JSON.stringify(styleInfo, null, 2)}
      </pre>
    </div>
  )
}
