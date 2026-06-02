import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthPage = path === '/auth/login' || path === '/auth/register'
  const isProtected =
    path.startsWith('/student') ||
    path.startsWith('/admin') ||
    path.startsWith('/weeks') ||
    path.startsWith('/dashboard')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && (isAuthPage || path === '/')) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const profile = profileData as { role?: 'student' | 'admin' } | null

    return NextResponse.redirect(
      new URL(profile?.role === 'admin' ? '/admin' : '/student/dashboard', request.url)
    )
  }

  if (user && path.startsWith('/admin')) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const profile = profileData as { role?: 'student' | 'admin' } | null

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
    '/weeks/:path*',
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
    '/',
  ],
}
