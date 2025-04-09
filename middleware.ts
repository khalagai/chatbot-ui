import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Allow access to public paths without authentication
  const publicPaths = ['/login', '/signup', '/reset-password']
  if (publicPaths.includes(path)) {
    if (session) {
      // If user is already logged in, redirect to chat
      return NextResponse.redirect(new URL('/chat', req.url))
    }
    return res
  }

  // Handle root path
  if (path === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  // Protect all other routes
  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is on /chat without a workspace ID, try to get their home workspace
  if (path === '/chat') {
    try {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('is_home', true)
        .single()

      if (workspace) {
        return NextResponse.redirect(new URL(`/chat/${workspace.id}`, req.url))
      }
    } catch (error) {
      console.error('Error fetching workspace:', error)
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
