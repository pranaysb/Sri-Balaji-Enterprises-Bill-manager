export interface CreateBillRequest {
  bill_no: string;
  billing_date: string;
  vehicle_number?: string;
  quantity: number;
  total_amount: number;
  buyer_address: string;
  buyer_name?: string;
  buyer_gst?: string;
}

export interface UpdateBillRequest extends Partial<CreateBillRequest> {
  id: string;
}

export interface CreateAddressRequest {
  name: string;
  address: string;
  gst_number?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}