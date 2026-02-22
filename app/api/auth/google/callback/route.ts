import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/gmail'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.redirect(new URL('/dashboard?error=oauth_failed', request.url))
  }

  try {
    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString())

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Store email connection
    const { error: emailError } = await supabaseAdmin
      .from('email_connections')
      .upsert({
        user_id: userId,
        provider: 'gmail',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expiry: tokens.expiry.toISOString(),
      })

    if (emailError) throw emailError

    // Store storage connection (same tokens work for Drive)
    const { error: storageError } = await supabaseAdmin
      .from('storage_connections')
      .upsert({
        user_id: userId,
        provider: 'gdrive',
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expiry: tokens.expiry.toISOString(),
      })

    if (storageError) throw storageError

    // Update user status
    await supabaseAdmin
      .from('users')
      .update({
        gmail_connected: true,
        drive_connected: true,
      })
      .eq('id', userId)

    return NextResponse.redirect(new URL('/dashboard?connected=true', request.url))
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=connection_failed', request.url))
  }
}
