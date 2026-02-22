import { GmailService } from './gmail'
import { DriveService } from './drive'
import { classifyDocument } from './ai'
import { supabaseAdmin } from './supabase'

export interface ProcessResult {
  success: boolean
  processed: number
  errors: string[]
}

export async function processUserAttachments(userId: string): Promise<ProcessResult> {
  const errors: string[] = []
  let processed = 0

  try {
    // Get user's email connection
    const { data: emailConn, error: emailError } = await supabaseAdmin
      .from('email_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'gmail')
      .single()

    if (emailError || !emailConn) {
      errors.push('No Gmail connection found')
      return { success: false, processed: 0, errors }
    }

    // Get user's storage connection
    const { data: storageConn, error: storageError } = await supabaseAdmin
      .from('storage_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'gdrive')
      .single()

    if (storageError || !storageConn) {
      errors.push('No Google Drive connection found')
      return { success: false, processed: 0, errors }
    }

    // Initialize services
    const gmailService = new GmailService(
      emailConn.access_token,
      emailConn.refresh_token
    )

    const driveService = new DriveService(
      storageConn.access_token,
      storageConn.refresh_token
    )

    // Get folder structure
    const folders = await driveService.getFolderStructure()

    // Get last processed date
    const { data: lastProcessed } = await supabaseAdmin
      .from('processed_attachments')
      .select('processed_at')
      .eq('user_id', userId)
      .order('processed_at', { ascending: false })
      .limit(1)
      .single()

    const lastDate = lastProcessed?.processed_at 
      ? new Date(lastProcessed.processed_at)
      : undefined

    // Fetch unprocessed attachments
    const attachments = await gmailService.getUnprocessedAttachments(lastDate)

    console.log(`Found ${attachments.length} attachments for user ${userId}`)

    // Process each attachment
    for (const attachment of attachments) {
      try {
        // Classify document
        const metadata = await classifyDocument(
          attachment.filename,
          attachment.sender,
          attachment.subject
        )

        // Determine folder based on doc type
        let folderId: string
        switch (metadata.docType) {
          case 'Invoice':
            folderId = folders.invoices
            break
          case 'Contract':
            folderId = folders.contracts
            break
          case 'Receipt':
            folderId = folders.receipts
            break
          case 'Report':
            folderId = folders.reports
            break
          default:
            folderId = folders.other
        }

        // Upload to Drive
        const { webViewLink } = await driveService.uploadFile(
          metadata.suggestedFilename,
          attachment.data,
          attachment.mimeType,
          folderId
        )

        // Save to database
        await supabaseAdmin.from('processed_attachments').insert({
          user_id: userId,
          email_id: attachment.messageId,
          original_filename: attachment.filename,
          new_filename: metadata.suggestedFilename,
          doc_type: metadata.docType,
          metadata: {
            company: metadata.company,
            date: metadata.date,
            amount: metadata.amount,
            sender: attachment.sender,
            subject: attachment.subject,
          },
          storage_url: webViewLink,
        })

        // Mark email as processed
        await gmailService.markAsProcessed(attachment.messageId)

        processed++
      } catch (error) {
        console.error(`Error processing attachment ${attachment.filename}:`, error)
        errors.push(`${attachment.filename}: ${error}`)
      }
    }

    // Update last synced timestamp
    await supabaseAdmin
      .from('email_connections')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', emailConn.id)

    return {
      success: true,
      processed,
      errors,
    }
  } catch (error) {
    console.error('Error processing attachments:', error)
    errors.push(String(error))
    return {
      success: false,
      processed,
      errors,
    }
  }
}

export async function processAllUsers(): Promise<{
  total: number
  successful: number
  failed: number
  results: Record<string, ProcessResult>
}> {
  const results: Record<string, ProcessResult> = {}
  let successful = 0
  let failed = 0

  try {
    // Get all users with connections
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('gmail_connected', true)
      .eq('drive_connected', true)

    if (error || !users) {
      console.error('Error fetching users:', error)
      return { total: 0, successful: 0, failed: 0, results }
    }

    // Process each user
    for (const user of users) {
      const result = await processUserAttachments(user.id)
      results[user.id] = result

      if (result.success) {
        successful++
      } else {
        failed++
      }
    }

    return {
      total: users.length,
      successful,
      failed,
      results,
    }
  } catch (error) {
    console.error('Error processing all users:', error)
    return { total: 0, successful: 0, failed: 0, results }
  }
}
