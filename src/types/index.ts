export interface Bill {
  id: string;
  user_id: string;
  bill_no: string;
  billing_date: string;
  vehicle_number?: string;
  quantity: number;
  total_amount: number;
  buyer_address: string;
  buyer_name?: string;
  buyer_gst?: string;
  shipping_address?: string;
  shipping_name?: string;
  shipping_gst?: string;
  is_same_address: boolean;
  rate: number;
  taxless_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  total_tax: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  address: string;
  gst_number?: string;
  created_at: string;
}

export interface BillFormData {
  bill_no: string;
  billing_date: string;
  vehicle_number: string;
  quantity: string;
  total_amount: string;
  buyer_address: string;
  buyer_name: string;
  buyer_gst: string;
  shipping_address: string;
  shipping_name: string;
  shipping_gst: string;
  is_same_address: boolean;
}

export interface NewAddress {
  name: string;
  address: string;
  gst_number: string;
}