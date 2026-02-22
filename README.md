# Attachment Autopilot

**Stop wasting hours filing email attachments.**

Attachment Autopilot automatically downloads, renames, and organizes your invoices, contracts, and receipts from email — so you can get back to running your business.

## Features

- 📧 **Gmail Integration** - Monitors your email for attachments
- 🤖 **AI Classification** - Automatically identifies document types (Invoice, Contract, Receipt, Report, etc.)
- 📝 **Smart Renaming** - Generates consistent, searchable filenames
- 📁 **Auto-Organization** - Files documents into the right folders in Google Drive
- 📊 **Dashboard** - Track processed attachments and time saved
- ⏰ **Background Processing** - Runs every 15 minutes automatically

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **APIs:** Gmail API, Google Drive API, OpenAI API
- **Deployment:** Vercel (with cron jobs)

## Setup Instructions

### Prerequisites

1. Node.js 18+ installed
2. Supabase account
3. Google Cloud Console project
4. OpenAI API key
5. Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/aparajithn/attachment-autopilot.git
   cd attachment-autopilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `OPENAI_API_KEY` - OpenAI API key
   - `CRON_SECRET` - Random secret for cron job protection

4. **Set up Google OAuth**

   Go to [Google Cloud Console](https://console.cloud.google.com/):
   
   - Create a new project or select existing
   - Enable Gmail API and Google Drive API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback` (for local dev)
   - For production, add: `https://your-domain.com/api/auth/google/callback`

5. **Run database migrations**

   The schema is in `supabase/migrations/001_initial_schema.sql`. You can apply it via the Supabase dashboard or using the Supabase CLI.

6. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy!

3. **Set up Vercel Cron**
   
   The `vercel.json` file configures a cron job to run every 15 minutes. Make sure to set `CRON_SECRET` in your Vercel environment variables.

4. **Update Google OAuth redirect URI**
   
   Add your Vercel domain to Google Cloud Console authorized redirect URIs:
   ```
   https://your-app.vercel.app/api/auth/google/callback
   ```

## Project Structure

```
attachment-autopilot/
├── app/
│   ├── api/
│   │   ├── auth/google/         # OAuth flow
│   │   └── cron/                # Background processing
│   ├── dashboard/               # Main dashboard
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── gmail.ts                 # Gmail API wrapper
│   ├── drive.ts                 # Google Drive API wrapper
│   ├── ai.ts                    # OpenAI classification
│   └── processor.ts             # Main processing logic
├── supabase/
│   └── migrations/              # Database schema
├── .env.example                 # Environment variables template
├── vercel.json                  # Vercel config (cron jobs)
└── README.md                    # This file
```

## How It Works

1. **User signs up** and connects Gmail + Google Drive via OAuth
2. **Cron job runs every 15 minutes** (`/api/cron/process-attachments`)
3. **For each user**, the system:
   - Fetches new emails with attachments
   - Downloads each attachment
   - Sends to OpenAI to classify and extract metadata
   - Generates smart filename (e.g., `2026-02-22_AcmeCorp_Invoice_$1234.pdf`)
   - Uploads to appropriate folder in Google Drive
   - Logs to database
4. **User views processed attachments** in the dashboard

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

Key tables:
- `users` - User profiles
- `email_connections` - Gmail OAuth tokens
- `storage_connections` - Google Drive OAuth tokens
- `processed_attachments` - Log of all processed files

## API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /POST /api/cron/process-attachments` - Cron job endpoint (protected)

## Security

- OAuth tokens stored encrypted in database
- Row Level Security (RLS) enabled on all tables
- Cron endpoint protected with secret token
- Read-only Gmail access (no email deletion)
- No email content stored (only attachment metadata)

## Roadmap

- [ ] Outlook/Microsoft 365 support
- [ ] Dropbox integration
- [ ] Custom rules builder
- [ ] Bulk processing (historical emails)
- [ ] Team/multi-user support
- [ ] QuickBooks/Xero integration

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
