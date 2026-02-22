import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">Attachment Autopilot</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Stop wasting hours filing email attachments
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Attachment Autopilot automatically downloads, renames, and organizes your invoices, 
          contracts, and receipts — so you can get back to running your business.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Your Free Trial
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          No credit card required. 14 days free.
        </p>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Still doing this?</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-2xl mr-3">📥</span>
                  <span>Download invoice PDF from email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">✏️</span>
                  <span>Rename it "2026-02-Acme-Invoice.pdf" (or was it "Acme_Invoice_Feb_2026"?)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">📁</span>
                  <span>Save to "Documents/Business/Invoices/2026/"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-2xl mr-3">🔁</span>
                  <span>Repeat 50 times per month</span>
                </li>
              </ul>
              <p className="text-center mt-8 text-xl font-semibold text-red-600">
                That's 3-5 hours wasted every week.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Here's how it works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">🔗</div>
                <CardTitle>1. Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect your email (Gmail or Outlook) and storage (Google Drive or Dropbox)
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">⚙️</div>
                <CardTitle>2. Configure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set simple rules or let AI handle everything automatically
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl mb-4">🎯</div>
                <CardTitle>3. Relax</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Attachments are automatically organized with smart naming and filing
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-semibold mb-6">Attachment Autopilot:</h3>
            <div className="space-y-3 text-lg">
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>Monitors your email for attachments</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>Extracts invoices, contracts, receipts automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>Renames files with smart, consistent naming</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>Organizes into the right folders</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span>Keeps a searchable history</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to save hours every week?</h2>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required. 14 days free.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2026 Attachment Autopilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
