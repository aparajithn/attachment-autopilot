import { NextRequest, NextResponse } from 'next/server'
import { processAllUsers } from '@/lib/processor'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await processAllUsers()

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Processing failed', message: String(error) },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
