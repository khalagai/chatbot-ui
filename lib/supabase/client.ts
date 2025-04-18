import { createBrowserClient } from "@supabase/ssr"

const cookieMethods = {
  get: (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return undefined
  },
  set: (
    name: string,
    value: string,
    options: { path?: string; maxAge?: number } = {}
  ) => {
    let cookie = `${name}=${value}`
    if (options.path) cookie += `; path=${options.path}`
    if (options.maxAge) cookie += `; max-age=${options.maxAge}`
    document.cookie = cookie
  },
  remove: (name: string, options: { path?: string } = {}) => {
    document.cookie = `${name}=; max-age=0${options.path ? `; path=${options.path}` : ""}`
  }
}

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        debug: process.env.NODE_ENV === "development"
      },
      global: {
        headers: {
          "X-Client-Info": "chatbot-ui"
        }
      }
    }
  )
}

// Create a singleton instance
const supabase = createClient()

// Add error handling middleware
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    // Clear any sensitive data
    localStorage.removeItem("supabase.auth.token")
  }
})

export { supabase }
