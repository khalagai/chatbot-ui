import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM, LLMID, MessageImage, ModelProvider } from "@/types"
import {
  IconBolt,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCircleFilled,
  IconFileText,
  IconMoodSmile,
  IconPencil,
  IconRobotFace,
  IconUser
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import { FileIcon } from "../ui/file-icon"
import { FilePreview } from "../ui/file-preview"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { MessageActions } from "./message-actions"
import { MessageMarkdown } from "./message-markdown"
import styles from "./message.module.css"
import type { CSSProperties } from 'react';
import { StyleDebug } from './style-debug';

const ICON_SIZE = 32

interface MessageProps {
  message: Tables<"messages">
  fileItems: Tables<"file_items">[]
  isEditing: boolean
  isLast: boolean
  onStartEdit: (message: Tables<"messages">) => void
  onCancelEdit: () => void
  onSubmitEdit: (value: string, sequenceNumber: number) => void
}

export const Message: FC<MessageProps> = ({
  message,
  fileItems,
  isEditing,
  isLast,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit
}) => {
  const {
    assistants,
    profile,
    isGenerating,
    setIsGenerating,
    firstTokenReceived,
    availableLocalModels,
    availableOpenRouterModels,
    chatMessages,
    selectedAssistant,
    chatImages,
    assistantImages,
    toolInUse,
    files,
    models
  } = useContext(ChatbotUIContext)

  const { handleSendMessage } = useChatHandler()

  const editInputRef = useRef<HTMLTextAreaElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [editedMessage, setEditedMessage] = useState(message.content)

  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)

  const [showFileItemPreview, setShowFileItemPreview] = useState(false)
  const [selectedFileItem, setSelectedFileItem] =
    useState<Tables<"file_items"> | null>(null)

  const [viewSources, setViewSources] = useState(false)

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message.content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = message.content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleSendEdit = () => {
    onSubmitEdit(editedMessage, message.sequence_number)
    onCancelEdit()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing && event.key === "Enter" && event.metaKey) {
      handleSendEdit()
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true
    )
  }

  const handleStartEdit = () => {
    onStartEdit(message)
  }

  useEffect(() => {
    setEditedMessage(message.content)

    if (isEditing && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [isEditing])

  const MODEL_DATA = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ].find(llm => llm.modelId === message.model) as LLM

  const messageAssistantImage = assistantImages.find(
    image => image.assistantId === message.assistant_id
  )?.base64

  const selectedAssistantImage = assistantImages.find(
    image => image.path === selectedAssistant?.image_path
  )?.base64

  const modelDetails = LLM_LIST.find(model => model.modelId === message.model)

  const fileAccumulator: Record<
    string,
    {
      id: string
      name: string
      count: number
      type: string
      description: string
    }
  > = {}

  const fileSummary = fileItems.reduce((acc, fileItem) => {
    const parentFile = files.find(file => file.id === fileItem.file_id)
    if (parentFile) {
      if (!acc[parentFile.id]) {
        acc[parentFile.id] = {
          id: parentFile.id,
          name: parentFile.name,
          count: 1,
          type: parentFile.type,
          description: parentFile.description
        }
      } else {
        acc[parentFile.id].count += 1
      }
    }
    return acc
  }, fileAccumulator)

  const inlineStyles: Record<string, CSSProperties> = {
    wrapper: {
      display: 'flex',
      width: '100%',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '0 1rem',
      position: 'relative',
      margin: '1rem 0'
    },
    wrapperUser: {
      justifyContent: 'flex-end'
    },
    wrapperAssistant: {
      justifyContent: 'flex-start'
    },
    message: {
      position: 'relative',
      maxWidth: '80%',
      borderRadius: '0.5rem',
      padding: '1rem',
      fontSize: '0.875rem',
      margin: '0.5rem 0'
    },
    messageAssistant: {
      backgroundColor: 'rgb(39 39 42)',
      color: 'white',
      border: '1px solid rgb(63 63 70)'
    },
    messageUser: {
      backgroundColor: 'rgb(37 99 235)',
      color: 'white'
    },
    avatar: {
      display: 'flex',
      width: '2rem',
      height: '2rem',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '9999px',
      flexShrink: 0
    },
    avatarAssistant: {
      backgroundColor: 'rgb(39 39 42)',
      border: '1px solid rgb(63 63 70)'
    },
    avatarUser: {
      backgroundColor: 'rgb(37 99 235)'
    }
  };

  // Debug styles
  useEffect(() => {
    // Log computed styles for debugging
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
      const computedStyle = window.getComputedStyle(messageElement);
      console.log('Message computed styles:', {
        id: message.id,
        role: message.role,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius,
        maxWidth: computedStyle.maxWidth
      });
    }
  }, [message.id, message.role]);

  const messageClasses = cn(
    "chat-message",
    message.role === "assistant" ? "chat-message-assistant" : "chat-message-user"
  );

  const avatarClasses = cn(
    "chat-avatar",
    message.role === "assistant" ? "chat-avatar-assistant" : "chat-avatar-user"
  );

  // Log class application
  useEffect(() => {
    console.log('Applied classes:', {
      id: message.id,
      role: message.role,
      messageClasses,
      avatarClasses
    });
  }, [message.id, message.role, messageClasses, avatarClasses]);

  return (
    <>
      <div
        className="message-wrapper"
        data-message-id={message.id}
        data-role={message.role}
        data-is-editing={isEditing}
        data-is-last={isLast}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onKeyDown={handleKeyDown}
      >
        {message.role === "assistant" && (
          <div 
            className={avatarClasses}
            data-component="avatar"
            data-role={message.role}
          >
            {messageAssistantImage ? (
              <Image
                className="rounded"
                src={messageAssistantImage}
                alt="assistant"
                width={32}
                height={32}
              />
            ) : (
              <IconRobotFace size={20} className="text-zinc-400" />
            )}
          </div>
        )}

        <div 
          className={messageClasses}
          data-component="message"
          data-role={message.role}
        >
          <div 
            className="whitespace-pre-wrap"
            data-component="message-content"
          >
            {isEditing ? (
              <TextareaAutosize
                textareaRef={editInputRef}
                className="w-full resize-none bg-transparent p-0 focus:outline-none"
                value={editedMessage}
                onValueChange={setEditedMessage}
                maxRows={20}
              />
            ) : (
              <MessageMarkdown content={message.content} />
            )}
          </div>
          <div 
            className="absolute bottom-1 right-2 text-xs text-zinc-400"
            data-component="timestamp"
          >
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>

        {message.role === "user" && (
          <div 
            className={avatarClasses}
            data-component="avatar"
            data-role={message.role}
          >
            {profile?.image_url ? (
              <Image
                className="rounded"
                src={profile.image_url}
                alt="user"
                width={32}
                height={32}
              />
            ) : (
              <IconUser size={20} className="text-zinc-400" />
            )}
          </div>
        )}

        {isHovering && !isEditing && (
          <div 
            className="absolute right-2 top-2"
            data-component="actions"
          >
            <MessageActions
              onCopy={handleCopy}
              onEdit={handleStartEdit}
              isAssistant={message.role === "assistant"}
              isLast={isLast}
              isEditing={isEditing}
              isHovering={isHovering}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}

        {isEditing && (
          <div 
            className="mt-4 flex justify-end space-x-2"
            data-component="edit-buttons"
          >
            <Button 
              size="sm" 
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={handleSendEdit}
            >
              Save & Send
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancelEdit}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {isHovering && <StyleDebug targetId={message.id} />}
    </>
  )
}
