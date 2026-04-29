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
      masters: {
        Row: {
          id: string
          name_ru: string
          name_uz: string
          role_ru: string
          role_uz: string
          experience: number
          image: string
          bio_ru: string
          bio_uz: string
          tg_chat_id: string | null
          work_schedule: Json
          work_time_start: string
          work_time_end: string
          created_at: string
        }
        Insert: {
          id: string
          name_ru: string
          name_uz: string
          role_ru: string
          role_uz: string
          experience: number
          image: string
          bio_ru: string
          bio_uz: string
          tg_chat_id?: string | null
          work_schedule?: Json
          work_time_start?: string
          work_time_end?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['masters']['Insert']>
      }
      service_categories: {
        Row: {
          id: string
          name_ru: string
          name_uz: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ru: string
          name_uz: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['service_categories']['Insert']>
      }
      services: {
        Row: {
          id: string
          category_id: string | null
          name_ru: string
          name_uz: string
          price: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name_ru: string
          name_uz: string
          price: number
          duration: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      master_services: {
        Row: {
          master_id: string
          service_id: string
        }
        Insert: {
          master_id: string
          service_id: string
        }
        Update: Partial<Database['public']['Tables']['master_services']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          master_id: string | null
          service_id: string | null
          client_name: string
          client_phone: string
          comment: string | null
          date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          master_id?: string | null
          service_id?: string | null
          client_name: string
          client_phone: string
          comment?: string | null
          date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      contacts: {
        Row: {
          id: number
          phone: string
          instagram: string
          address_ru: string
          address_uz: string
          updated_at: string
        }
        Insert: {
          id?: number
          phone: string
          instagram: string
          address_ru: string
          address_uz: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
      }
      admin_chats: {
        Row: {
          id: string
          tg_chat_id: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tg_chat_id: string
          description?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_chats']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

