import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a response object that we can modify
  const res = NextResponse.next()
  
  // Create a Supabase client with the request and response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: '', ...options }),
      },
    }
  )
  
  // Get the current session
  const {
    data: { session }
  } = await supabase.auth.getSession()
  
  // Get the current path
  const path = req.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/reset-password']
  
  // Check if the current path is a public path
  if (publicPaths.includes(path)) {
    // If user is already logged in and trying to access a public path, redirect to chat
    if (session) {
      return NextResponse.redirect(new URL('/chat', req.url))
    }
    // Otherwise, allow access to the public path
    return res
  }
  
  // Handle the root path
  if (path === '/') {
    if (!session) {
      // If not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }
    // If logged in, redirect to chat
    return NextResponse.redirect(new URL('/chat', req.url))
  }
  
  // For all other routes, check if the user is authenticated
  if (!session) {
    // If not authenticated, redirect to login with the current path as a redirect parameter
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is on /chat without a workspace ID, try to get their home workspace
  if (path === '/chat') {
    try {
      // Fetch the user's home workspace
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('is_home', true)
        .single()
      
      if (error) {
        console.error('Error fetching workspace:', error)
        // If there's an error, just continue to /chat without a workspace ID
        return res
      }
      
      if (workspace) {
        // If a home workspace exists, redirect to it
        return NextResponse.redirect(new URL(`/chat/${workspace.id}`, req.url))
      }
      
      // If no home workspace exists, continue to /chat
      return res
    } catch (error) {
      console.error('Error in workspace fetch:', error)
      // If there's an error, just continue to /chat without a workspace ID
      return res
    }
  }
  
  // For all other authenticated routes, allow access
  return res
}

// Configure the middleware to run on all routes except static files and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
