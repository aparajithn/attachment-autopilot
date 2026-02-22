import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function Dashboard() {
  const supabase = await createSupabaseServerClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get processed attachments
  const { data: attachments, count } = await supabase
    .from('processed_attachments')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('processed_at', { ascending: false })
    .limit(10)

  const totalProcessed = count || 0
  const timeSaved = Math.round(totalProcessed * 5) // 5 minutes per attachment

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Attachment Autopilot</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" type="submit">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Processed</CardDescription>
              <CardTitle className="text-4xl">{totalProcessed}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Attachments organized</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Time Saved</CardDescription>
              <CardTitle className="text-4xl">{timeSaved}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Minutes saved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Status</CardDescription>
              <CardTitle className="text-2xl">
                {userData?.gmail_connected && userData?.drive_connected ? (
                  <span className="text-green-600">✓ Connected</span>
                ) : (
                  <span className="text-yellow-600">⚠ Setup Needed</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">System status</p>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        {(!userData?.gmail_connected || !userData?.drive_connected) && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>Setup Required</CardTitle>
              <CardDescription>
                Connect your accounts to start processing attachments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-medium">Gmail & Google Drive</p>
                      <p className="text-sm text-gray-600">
                        {userData?.gmail_connected ? '✓ Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {!userData?.gmail_connected && (
                    <Link href="/api/auth/google">
                      <Button>Connect Google</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attachments</CardTitle>
            <CardDescription>
              Your most recently processed files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attachments && attachments.length > 0 ? (
              <div className="space-y-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{attachment.new_filename}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-600">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {attachment.doc_type}
                        </span>
                        <span>{attachment.metadata?.company}</span>
                        <span>{new Date(attachment.processed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a
                      href={attachment.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View in Drive →
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No attachments processed yet.</p>
                <p className="text-sm mt-2">
                  {userData?.gmail_connected 
                    ? 'Waiting for new emails with attachments...'
                    : 'Connect your accounts to get started.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
