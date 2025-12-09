export interface Database {
  public: {
    Tables: {
      bills: {
        Row: {
          id: string
          user_id: string
          bill_no: string
          billing_date: string
          vehicle_number: string | null
          quantity: number
          total_amount: number
          buyer_address: string
          buyer_name: string | null
          buyer_gst: string | null
          shipping_address: string | null
          shipping_name: string | null
          shipping_gst: string | null
          is_same_address: boolean
          rate: number
          taxless_amount: number
          cgst_amount: number
          sgst_amount: number
          total_tax: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bill_no: string
          billing_date: string
          vehicle_number?: string | null
          quantity: number
          total_amount: number
          buyer_address: string
          buyer_name?: string | null
          buyer_gst?: string | null
          shipping_address?: string | null
          shipping_name?: string | null
          shipping_gst?: string | null
          is_same_address?: boolean
          rate?: number
          taxless_amount?: number
          cgst_amount?: number
          sgst_amount?: number
          total_tax?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bill_no?: string
          billing_date?: string
          vehicle_number?: string | null
          quantity?: number
          total_amount?: number
          buyer_address?: string
          buyer_name?: string | null
          buyer_gst?: string | null
          shipping_address?: string | null
          shipping_name?: string | null
          shipping_gst?: string | null
          is_same_address?: boolean
          rate?: number
          taxless_amount?: number
          cgst_amount?: number
          sgst_amount?: number
          total_tax?: number
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          gst_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          gst_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          gst_number?: string | null
          created_at?: string
        }
      }
    }
  }
}