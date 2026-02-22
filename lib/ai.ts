import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface DocumentMetadata {
  docType: 'Invoice' | 'Contract' | 'Receipt' | 'Report' | 'Proposal' | 'Other'
  company?: string
  date?: string
  amount?: string
  parties?: string[]
  suggestedFilename: string
}

export async function classifyDocument(
  filename: string,
  sender: string,
  subject: string,
  fileContent?: string
): Promise<DocumentMetadata> {
  try {
    const prompt = `Analyze this document and extract metadata:

Filename: ${filename}
Email Sender: ${sender}
Email Subject: ${subject}
${fileContent ? `Content Preview: ${fileContent.substring(0, 500)}` : ''}

Classify this document and extract:
1. Document type (Invoice, Contract, Receipt, Report, Proposal, or Other)
2. Company/entity name
3. Date (in YYYY-MM-DD format if found)
4. Amount (if it's an invoice or receipt)
5. Contract parties (if it's a contract)

Generate a clean filename following this format:
[Date]_[Company]_[DocType]_[Detail].[extension]

Example: 2026-02-22_AcmeCorp_Invoice_$1234.pdf

Respond in JSON format:
{
  "docType": "Invoice",
  "company": "Acme Corp",
  "date": "2026-02-22",
  "amount": "$1,234.00",
  "parties": [],
  "suggestedFilename": "2026-02-22_AcmeCorp_Invoice_$1234.pdf"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a document classification assistant. Analyze documents and extract structured metadata. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    // Parse JSON response
    const metadata = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim())

    // Ensure we have a valid docType
    if (!['Invoice', 'Contract', 'Receipt', 'Report', 'Proposal', 'Other'].includes(metadata.docType)) {
      metadata.docType = 'Other'
    }

    // Generate filename if not provided
    if (!metadata.suggestedFilename) {
      metadata.suggestedFilename = generateFallbackFilename(filename, metadata)
    }

    return metadata
  } catch (error) {
    console.error('Error classifying document:', error)
    
    // Fallback to basic classification
    return {
      docType: detectDocType(filename, subject),
      company: extractCompany(sender),
      date: new Date().toISOString().split('T')[0],
      suggestedFilename: generateFallbackFilename(filename, {}),
    }
  }
}

function detectDocType(filename: string, subject: string): DocumentMetadata['docType'] {
  const text = `${filename} ${subject}`.toLowerCase()
  
  if (text.includes('invoice')) return 'Invoice'
  if (text.includes('contract') || text.includes('agreement')) return 'Contract'
  if (text.includes('receipt')) return 'Receipt'
  if (text.includes('report')) return 'Report'
  if (text.includes('proposal')) return 'Proposal'
  
  return 'Other'
}

function extractCompany(sender: string): string {
  // Extract company name from email
  const match = sender.match(/(?:@|from\s+)([^@<>\s]+)/i)
  if (match) {
    return match[1].split('.')[0].replace(/[^a-zA-Z0-9]/g, '')
  }
  return 'Unknown'
}

function generateFallbackFilename(
  originalFilename: string,
  metadata: Partial<DocumentMetadata>
): string {
  const date = metadata.date || new Date().toISOString().split('T')[0]
  const company = metadata.company || 'Unknown'
  const docType = metadata.docType || 'Document'
  const extension = originalFilename.split('.').pop() || 'pdf'
  
  return `${date}_${company}_${docType}.${extension}`
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}
