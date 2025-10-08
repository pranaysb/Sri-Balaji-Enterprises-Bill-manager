import type { 
  CreateBillRequest, 
  UpdateBillRequest, 
  CreateAddressRequest,
  ApiResponse 
} from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

class ApiClient {
  private async fetchApi(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}/api${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    const data: ApiResponse = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  }

  // Bills API
  async getBills() {
    return this.fetchApi('/bills')
  }

  async getBill(id: string) {
    return this.fetchApi(`/bills/${id}`)
  }

  async createBill(billData: CreateBillRequest) {
    return this.fetchApi('/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    })
  }

  async updateBill(id: string, billData: UpdateBillRequest) {
    return this.fetchApi(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billData),
    })
  }

  async deleteBill(id: string) {
    return this.fetchApi(`/bills/${id}`, {
      method: 'DELETE',
    })
  }

  // Addresses API
  async getAddresses() {
    return this.fetchApi('/addresses')
  }

  async getAddress(id: string) {
    return this.fetchApi(`/addresses/${id}`)
  }

  async createAddress(addressData: CreateAddressRequest) {
    return this.fetchApi('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    })
  }

  async updateAddress(id: string, addressData: CreateAddressRequest) {
    return this.fetchApi(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    })
  }

  async deleteAddress(id: string) {
    return this.fetchApi(`/addresses/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()