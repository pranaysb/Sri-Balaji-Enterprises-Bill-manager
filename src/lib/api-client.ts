import type {
  CreateBillRequest,
  UpdateBillRequest,
  CreateAddressRequest,
  ApiResponse
} from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const apiClient = {
  async fetchApi(endpoint: string, token?: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      throw new Error(`API route not found: ${endpoint}`)
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized')
      }
      if (response.status === 404) {
        throw new Error(`API endpoint not found: ${endpoint}`)
      }
    }

    let data: ApiResponse
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError)
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  },

  // Bills API
  async getBills(token?: string) {
    return this.fetchApi('/bills', token)
  },

  async getBill(id: string, token?: string) {
    return this.fetchApi(`/bills/${id}`, token)
  },

  async createBill(billData: CreateBillRequest, token?: string) {
    return this.fetchApi('/bills', token, {
      method: 'POST',
      body: JSON.stringify(billData),
    })
  },

  async updateBill(id: string, billData: UpdateBillRequest, token?: string) {
    return this.fetchApi(`/bills/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(billData),
    })
  },

  async deleteBill(id: string, token?: string) {
    return this.fetchApi(`/bills/${id}?id=${id}`, token, {
      method: 'DELETE',
    })
  },

  // Addresses API
  async getAddresses(token?: string) {
    return this.fetchApi('/addresses', token)
  },

  async getAddress(id: string, token?: string) {
    return this.fetchApi(`/addresses/${id}`, token)
  },

  async createAddress(addressData: CreateAddressRequest, token?: string) {
    return this.fetchApi('/addresses', token, {
      method: 'POST',
      body: JSON.stringify(addressData),
    })
  },

  async updateAddress(id: string, addressData: CreateAddressRequest, token?: string) {
    return this.fetchApi(`/addresses/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    })
  },

  async deleteAddress(id: string, token?: string) {
    return this.fetchApi(`/addresses/${id}?id=${id}`, token, {
      method: 'DELETE',
    })
  },
}