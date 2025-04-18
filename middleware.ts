import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we can modify
    let res = NextResponse.next()
    
    // Create a Supabase client with the request and response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options
            })
            res = NextResponse.next({
              request: {
                headers: req.headers
              }
            })
            res.cookies.set({
              name,
              value,
              ...options
            })
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options
            })
            res = NextResponse.next({
              request: {
                headers: req.headers
              }
            })
            res.cookies.set({
              name,
              value: '',
              ...options
            })
          }
        }
      }
    )
    
    // Get the current session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      )
    }
    
    // Get the current path
    const path = req.nextUrl.pathname
    
    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/signup', '/reset-password', '/api/auth']
    
    // Check if the current path is a public path
    if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
      return res
    }
    
    // Handle the root path
    if (path === '/') {
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      return NextResponse.redirect(new URL('/chat', req.url))
    }
    
    // For all other routes, check if the user is authenticated
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If user is on /chat without a workspace ID, try to get their home workspace
    if (path === '/chat') {
      try {
        const { data: workspace, error } = await supabase
          .from('workspaces')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('is_home', true)
          .single()
        
        if (error) {
          console.error('Error fetching workspace:', error)
          return res
        }
        
        if (workspace) {
          return NextResponse.redirect(new URL(`/chat/${workspace.id}`, req.url))
        }
        
        return res
      } catch (error) {
        console.error('Error in workspace fetch:', error)
        return res
      }
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Configure the middleware to run on all routes except static files and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
