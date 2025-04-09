import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /login,
  // redirect the user to /login
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and the current path is /login,
  // redirect the user to /chat
  if (session && req.nextUrl.pathname === '/login') {
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
      // If there's an error, redirect to /chat without a specific workspace
      return NextResponse.redirect(new URL('/chat', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
