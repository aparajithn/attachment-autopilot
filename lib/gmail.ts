import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export interface GmailAttachment {
  messageId: string
  filename: string
  mimeType: string
  size: number
  attachmentId: string
  data: Buffer
  sender: string
  subject: string
  date: Date
}

export class GmailService {
  private oauth2Client: OAuth2Client

  constructor(accessToken: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  async getUnprocessedAttachments(lastProcessedDate?: Date): Promise<GmailAttachment[]> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    const attachments: GmailAttachment[] = []

    try {
      // Search for emails with attachments
      const query = lastProcessedDate 
        ? `has:attachment after:${Math.floor(lastProcessedDate.getTime() / 1000)}`
        : 'has:attachment newer_than:1d'

      const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50,
      })

      const messages = res.data.messages || []

      // Fetch each message and extract attachments
      for (const message of messages) {
        if (!message.id) continue

        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        })

        const headers = msg.data.payload?.headers || []
        const sender = headers.find(h => h.name === 'From')?.value || ''
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const dateStr = headers.find(h => h.name === 'Date')?.value || ''
        const date = new Date(dateStr)

        // Extract attachments from parts
        const parts = msg.data.payload?.parts || []
        for (const part of parts) {
          if (part.filename && part.body?.attachmentId) {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: message.id,
              id: part.body.attachmentId,
            })

            if (attachment.data.data) {
              attachments.push({
                messageId: message.id,
                filename: part.filename,
                mimeType: part.mimeType || 'application/octet-stream',
                size: part.body.size || 0,
                attachmentId: part.body.attachmentId,
                data: Buffer.from(attachment.data.data, 'base64'),
                sender,
                subject,
                date,
              })
            }
          }
        }
      }

      return attachments
    } catch (error) {
      console.error('Error fetching Gmail attachments:', error)
      throw error
    }
  }

  async markAsProcessed(messageId: string): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

    try {
      // Add a label to mark as processed
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['INBOX'], // Could create custom label
          removeLabelIds: [],
        },
      })
    } catch (error) {
      console.error('Error marking message as processed:', error)
    }
  }

  async refreshTokenIfNeeded(): Promise<{ accessToken: string; refreshToken: string; expiry: Date }> {
    const { credentials } = await this.oauth2Client.refreshAccessToken()
    
    return {
      accessToken: credentials.access_token || '',
      refreshToken: credentials.refresh_token || '',
      expiry: new Date(credentials.expiry_date || Date.now() + 3600000),
    }
  }
}

export function createGmailOAuthUrl(state: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
  )

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/drive.file',
    ],
    state,
    prompt: 'consent',
  })
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiry: Date
}> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)

  return {
    accessToken: tokens.access_token || '',
    refreshToken: tokens.refresh_token || '',
    expiry: new Date(tokens.expiry_date || Date.now() + 3600000),
  }
}
