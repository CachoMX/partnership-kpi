export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CallResult =
  | 'Closed'
  | 'Follow-Up Scheduled'
  | 'No Show'
  | 'DQ'
  | 'Reschedule'
  | 'Other'

export type UserRole = 'closer' | 'setter' | 'admin'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      closers: {
        Row: {
          id: string
          name: string
          email: string | null
          total_calls: number
          live_calls: number
          no_shows: number
          closed_deals: number
          offers_made: number
          total_revenue: number
          total_cash_collected: number
          total_commission: number
          commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          total_calls?: number
          live_calls?: number
          no_shows?: number
          closed_deals?: number
          offers_made?: number
          total_revenue?: number
          total_cash_collected?: number
          total_commission?: number
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          total_calls?: number
          live_calls?: number
          no_shows?: number
          closed_deals?: number
          offers_made?: number
          total_revenue?: number
          total_cash_collected?: number
          total_commission?: number
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      setters: {
        Row: {
          id: string
          name: string
          email: string | null
          total_calls_booked: number
          total_shows: number
          total_closes: number
          show_rate: number
          close_rate: number
          total_revenue_generated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          total_calls_booked?: number
          total_shows?: number
          total_closes?: number
          show_rate?: number
          close_rate?: number
          total_revenue_generated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          total_calls_booked?: number
          total_shows?: number
          total_closes?: number
          show_rate?: number
          close_rate?: number
          total_revenue_generated?: number
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          timestamp: string | null
          booking_date: string | null
          lead_name: string | null
          lead_phone: string | null
          lead_email: string | null
          offer_made: boolean
          result: CallResult | null
          closer_id: string | null
          closer_name: string
          revenue: number
          cash_collected: number
          cash_collected_2: number
          lead_source: string | null
          medium: string | null
          campaign: string | null
          call_recording_link: string | null
          setter_id: string | null
          setter_name: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          timestamp?: string | null
          booking_date?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          lead_email?: string | null
          offer_made?: boolean
          result?: CallResult | null
          closer_id?: string | null
          closer_name: string
          revenue?: number
          cash_collected?: number
          cash_collected_2?: number
          lead_source?: string | null
          medium?: string | null
          campaign?: string | null
          call_recording_link?: string | null
          setter_id?: string | null
          setter_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          timestamp?: string | null
          booking_date?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          lead_email?: string | null
          offer_made?: boolean
          result?: CallResult | null
          closer_id?: string | null
          closer_name?: string
          revenue?: number
          cash_collected?: number
          cash_collected_2?: number
          lead_source?: string | null
          medium?: string | null
          campaign?: string | null
          call_recording_link?: string | null
          setter_id?: string | null
          setter_name?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      call_result: CallResult
      user_role: UserRole
    }
  }
}
