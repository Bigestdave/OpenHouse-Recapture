import type {
  Space,
  MediaItem,
  TimelineEvent,
  NotificationPreferences,
  BrandingConfig,
  PropertyStatus,
  CaptureRequestStatus,
} from '../data/types'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          owner_name: string
          owner_email: string
          work_type: string
          portfolio_size: string
          primary_market: string
          team_size: string
          listing_source: string
          require_approval: boolean
          default_visibility: string
          notification_preferences: NotificationPreferences
          branding: BrandingConfig | null
          created_at: number
          updated_at: number
        }
        Insert: {
          id: string
          name: string
          owner_name: string
          owner_email: string
          work_type?: string
          portfolio_size?: string
          primary_market?: string
          team_size?: string
          listing_source?: string
          require_approval?: boolean
          default_visibility?: string
          notification_preferences?: NotificationPreferences
          branding?: BrandingConfig | null
          created_at?: number
          updated_at?: number
        }
        Update: {
          id?: string
          name?: string
          owner_name?: string
          owner_email?: string
          work_type?: string
          portfolio_size?: string
          primary_market?: string
          team_size?: string
          listing_source?: string
          require_approval?: boolean
          default_visibility?: string
          notification_preferences?: NotificationPreferences
          branding?: BrandingConfig | null
          created_at?: number
          updated_at?: number
        }
      }
      properties: {
        Row: {
          id: string
          workspace_id: string
          title: string
          address: string
          type: string
          bedrooms: number
          bathrooms: number
          price: string
          description: string
          status: PropertyStatus
          spaces: Space[]
          source_media: MediaItem[]
          timeline: TimelineEvent[]
          experience_url: string | null
          cover_image: string | null
          created_at: number
          updated_at: number
        }
        Insert: {
          id: string
          workspace_id: string
          title: string
          address: string
          type: string
          bedrooms?: number
          bathrooms?: number
          price: string
          description?: string
          status?: PropertyStatus
          spaces?: Space[]
          source_media?: MediaItem[]
          timeline?: TimelineEvent[]
          experience_url?: string | null
          cover_image?: string | null
          created_at?: number
          updated_at?: number
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          address?: string
          type?: string
          bedrooms?: number
          bathrooms?: number
          price?: string
          description?: string
          status?: PropertyStatus
          spaces?: Space[]
          source_media?: MediaItem[]
          timeline?: TimelineEvent[]
          experience_url?: string | null
          cover_image?: string | null
          created_at?: number
          updated_at?: number
        }
      }
      capture_requests: {
        Row: {
          id: string
          property_id: string
          property_title: string
          room: string
          reason: string
          instructions: string
          estimated_time: string
          status: CaptureRequestStatus
          recipient_name: string
          recipient_phone: string | null
          recipient_email: string | null
          capture_url: string
          uploaded_media: MediaItem[] | null
          created_at: number
          updated_at: number
        }
        Insert: {
          id: string
          property_id: string
          property_title: string
          room: string
          reason: string
          instructions: string
          estimated_time?: string
          status?: CaptureRequestStatus
          recipient_name: string
          recipient_phone?: string | null
          recipient_email?: string | null
          capture_url: string
          uploaded_media?: MediaItem[] | null
          created_at?: number
          updated_at?: number
        }
        Update: {
          id?: string
          property_id?: string
          property_title?: string
          room?: string
          reason?: string
          instructions?: string
          estimated_time?: string
          status?: CaptureRequestStatus
          recipient_name?: string
          recipient_phone?: string | null
          recipient_email?: string | null
          capture_url?: string
          uploaded_media?: MediaItem[] | null
          created_at?: number
          updated_at?: number
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          property_title: string
          renter_name: string
          renter_phone: string
          renter_email: string
          preferred_date: string
          preferred_time: string
          message: string | null
          status: 'requested' | 'confirmed' | 'completed' | 'cancelled'
          created_at: number
        }
        Insert: {
          id: string
          property_id: string
          property_title: string
          renter_name: string
          renter_phone: string
          renter_email: string
          preferred_date: string
          preferred_time: string
          message?: string | null
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: number
        }
        Update: {
          id?: string
          property_id?: string
          property_title?: string
          renter_name?: string
          renter_phone?: string
          renter_email?: string
          preferred_date?: string
          preferred_time?: string
          message?: string | null
          status?: 'requested' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: number
        }
      }
    }
  }
}
