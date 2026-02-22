import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Attachment Autopilot - Automatically organize email attachments",
  description: "Stop wasting hours filing email attachments. Automatically download, rename, and organize invoices, contracts, and receipts.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
