import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          gmail_connected: boolean
          drive_connected: boolean
          subscription_tier: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          gmail_connected?: boolean
          drive_connected?: boolean
          subscription_tier?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          gmail_connected?: boolean
          drive_connected?: boolean
          subscription_tier?: string
        }
      }
      email_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          token_expiry: string
          last_synced: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          token_expiry: string
          last_synced?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string
          token_expiry?: string
          last_synced?: string
        }
      }
      storage_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          token_expiry: string
          root_folder_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          access_token: string
          refresh_token: string
          token_expiry: string
          root_folder_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          access_token?: string
          refresh_token?: string
          token_expiry?: string
          root_folder_id?: string | null
        }
      }
      processed_attachments: {
        Row: {
          id: string
          user_id: string
          email_id: string
          original_filename: string
          new_filename: string
          doc_type: string
          metadata: any
          storage_url: string
          processed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_id: string
          original_filename: string
          new_filename: string
          doc_type: string
          metadata?: any
          storage_url: string
          processed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_id?: string
          original_filename?: string
          new_filename?: string
          doc_type?: string
          metadata?: any
          storage_url?: string
          processed_at?: string
        }
      }
    }
  }
}
