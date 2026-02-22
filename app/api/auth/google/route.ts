import { NextRequest, NextResponse } from 'next/server'
import { createGmailOAuthUrl } from '@/lib/gmail'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Generate OAuth URL with state
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
  const authUrl = createGmailOAuthUrl(state)

  return NextResponse.redirect(authUrl)
}
