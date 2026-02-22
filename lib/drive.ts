import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { Readable } from 'stream'

export class DriveService {
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

  async ensureFolderExists(folderName: string, parentId?: string): Promise<string> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client })

    try {
      // Check if folder exists
      const query = parentId
        ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`

      const res = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      })

      if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id!
      }

      // Create folder if it doesn't exist
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      }

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      })

      return folder.data.id!
    } catch (error) {
      console.error('Error ensuring folder exists:', error)
      throw error
    }
  }

  async uploadFile(
    filename: string,
    buffer: Buffer,
    mimeType: string,
    folderId: string
  ): Promise<{ id: string; webViewLink: string }> {
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client })

    try {
      const fileMetadata = {
        name: filename,
        parents: [folderId],
      }

      const media = {
        mimeType,
        body: Readable.from(buffer),
      }

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      })

      return {
        id: file.data.id!,
        webViewLink: file.data.webViewLink || '',
      }
    } catch (error) {
      console.error('Error uploading file to Drive:', error)
      throw error
    }
  }

  async getFolderStructure(): Promise<{
    invoices: string
    contracts: string
    receipts: string
    reports: string
    other: string
  }> {
    // Ensure main "Attachment Autopilot" folder exists
    const rootFolderId = await this.ensureFolderExists('Attachment Autopilot')

    // Ensure subfolders exist
    const invoices = await this.ensureFolderExists('Invoices', rootFolderId)
    const contracts = await this.ensureFolderExists('Contracts', rootFolderId)
    const receipts = await this.ensureFolderExists('Receipts', rootFolderId)
    const reports = await this.ensureFolderExists('Reports', rootFolderId)
    const other = await this.ensureFolderExists('Other', rootFolderId)

    return {
      invoices,
      contracts,
      receipts,
      reports,
      other,
    }
  }
}
