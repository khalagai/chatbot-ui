import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, apiKey } = json as {
    chatSettings: ChatSettings
    messages: any[]
    apiKey?: string
  }

  try {
    // Use the provided API key or fall back to environment variable
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          message: "OpenAI API Key not found. Please set it in your WordPress settings or environment variables." 
        }),
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      organization: process.env.OPENAI_ORGANIZATION_ID
    })

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ||
        chatSettings.model === "gpt-4o"
          ? 4096
          : null,
      stream: false // Don't stream for WordPress integration
    })

    // Return a simple response for WordPress
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
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "OpenAI API Key not found. Please set it in your WordPress settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "OpenAI API Key is incorrect. Please fix it in your WordPress settings."
    }

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