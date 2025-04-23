import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { ChatCompletion, ChatCompletionChunk } from "openai/resources/chat/completions"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, apiKey, stream: shouldStream = false } = json as {
    chatSettings: ChatSettings
    messages: any[]
    apiKey?: string
    stream?: boolean
  }

  try {
    // Use the provided API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          message: "Groq API Key not found. Please set it in your WordPress settings." 
        }),
        { status: 400 }
      )
    }

    // Groq is compatible with the OpenAI SDK
    const groq = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    })

    // Default to Gemma 7B if no model specified
    const model = chatSettings.model || "meta-llama/llama-4-maverick-17b-128e-instruct"

    if (!shouldStream) {
      // For non-streaming responses (WordPress)
      const response = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: CHAT_SETTING_LIMITS[model]?.MAX_TOKEN_OUTPUT_LENGTH || 4096,
        stream: false,
        temperature: chatSettings.temperature || 0.7
      }) as ChatCompletion

      return new Response(
        JSON.stringify({ 
          response: response.choices[0].message.content 
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // For streaming responses
    const response = await groq.chat.completions.create({
      model,
      messages,
      max_tokens: CHAT_SETTING_LIMITS[model]?.MAX_TOKEN_OUTPUT_LENGTH || 4096,
      stream: true,
      temperature: chatSettings.temperature || 0.7
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)

  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage = "Groq API Key not found. Please set it in your WordPress settings."
    } else if (errorCode === 401) {
      errorMessage = "Groq API Key is incorrect. Please fix it in your WordPress settings."
    }

    console.error("Groq API Error:", error)

    return new Response(
      JSON.stringify({ message: errorMessage }),
      { 
        status: errorCode,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
