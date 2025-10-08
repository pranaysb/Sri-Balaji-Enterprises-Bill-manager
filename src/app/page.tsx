'use client'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import Link from 'next/link'
import { 
  Plus, 
  FileText, 
  Download, 
  Edit, 
  Trash2,
  User,
  LogIn,
  UserPlus
} from 'lucide-react'
import type { Bill } from '@/types'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBills()
    } else {
      setLoading(false)
    }
  }, [user])

  // Replace direct Supabase calls with API calls
const fetchBills = async (): Promise<void> => {
  try {
    const response = await apiClient.getBills()
    setBills(response.data || [])
  } catch (error) {
    console.error('Error fetching bills:', error)
    // Handle error (show toast, etc.)
  } finally {
    setLoading(false)
  }
}

const deleteBill = async (id: string): Promise<void> => {
  if (!confirm('Are you sure you want to delete this bill?')) return

  try {
    await apiClient.deleteBill(id)
    fetchBills() // Refresh the list
    // Show success message
  } catch (error) {
    console.error('Error deleting bill:', error)
    // Handle error
  }
}
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-amber-50">
        {/* Header */}
        <header className="bg-amber-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Sri Balaji Enterprises</h1>
                <p className="text-amber-200">Professional Bill Management</p>
              </div>
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="bg-white text-amber-900 font-semibold py-2 px-4 rounded-lg hover:bg-amber-100 transition-colors flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-amber-900 mb-6">
              Professional Bill Management
            </h1>
            <p className="text-xl text-amber-700 mb-8">
              Streamline your tax invoices, manage clients, and generate professional bills with our comprehensive billing solution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <SignUpButton mode="modal">
                <button className="bg-amber-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-amber-700 transition-transform transform hover:scale-105 flex items-center text-lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Get Started Free
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="border-2 border-amber-600 text-amber-600 font-bold py-4 px-8 rounded-lg hover:bg-amber-50 transition-colors text-lg">
                  Sign In
                </button>
              </SignInButton>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
                <FileText className="w-12 h-12 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Easy Bill Generation</h3>
                <p className="text-amber-700">
                  Create professional tax invoices in minutes with our intuitive bill maker.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
                <User className="w-12 h-12 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Client Management</h3>
                <p className="text-amber-700">
                  Save and manage client addresses for quick bill generation.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
                <Download className="w-12 h-12 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">PDF Export</h3>
                <p className="text-amber-700">
                  Download your bills as PDF files for printing and sharing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sri Balaji Enterprises</h1>
              <p className="text-amber-200">Professional Bill Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-amber-200">
                <User className="w-5 h-5" />
                <span>Welcome, {user.firstName || user.username}</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonTrigger: "text-amber-900 bg-amber-200 hover:bg-amber-300"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold">Total Bills</p>
                <p className="text-2xl font-bold text-amber-900">{bills.length}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold">This Month</p>
                <p className="text-2xl font-bold text-amber-900">
                  {bills.filter(bill => {
                    const billDate = new Date(bill.billing_date)
                    const now = new Date()
                    return billDate.getMonth() === now.getMonth() && 
                           billDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <Link href="/bill-maker">
            <div className="bg-amber-600 text-white rounded-lg shadow-md p-6 border-l-4 border-amber-700 cursor-pointer hover:bg-amber-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Create New Bill</p>
                  <p className="text-2xl font-bold">+</p>
                </div>
                <Plus className="w-8 h-8" />
              </div>
            </div>
          </Link>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900">Recent Bills</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center text-amber-700">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-4">No bills found.</p>
              <Link 
                href="/bill-maker"
                className="bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Bill
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Bill No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-amber-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-amber-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                        {bill.bill_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                        {new Date(bill.billing_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-amber-700">
                        {bill.buyer_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                        {bill.quantity} bags
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900 font-semibold">
                        ₹{bill.total_amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/bill/${bill.id}`}>
                            <button className="text-amber-600 hover:text-amber-900">
                              <FileText className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/bill-maker?edit=${bill.id}`}>
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => deleteBill(bill.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}