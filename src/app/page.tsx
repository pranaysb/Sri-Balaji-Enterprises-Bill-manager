'use client'
import { useUser, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
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
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react'
import type { Bill } from '@/types'

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchBills()
    } else if (isLoaded && !isSignedIn) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn])

  const fetchBills = async (showRefresh = false): Promise<void> => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('🔄 Fetching bills...')
      const token = await getToken()
      const response = await apiClient.getBills(token)

      console.log('📄 Bills response:', response)

      if (response.success) {
        setBills(response.data || [])
      } else {
        setError(response.error || 'Failed to fetch bills')
      }
    } catch (error: any) {
      console.error('❌ Error fetching bills:', error)
      setError(error.message || 'Failed to fetch bills. Please try again.')
      setBills([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const deleteBill = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this bill? This action cannot be undone.')) return

    try {
      const token = await getToken()
      await apiClient.deleteBill(id, token)
      await fetchBills(true)
    } catch (error: any) {
      console.error('Error deleting bill:', error)
      setError('Failed to delete bill. Please try again.')
    }
  }

  const retryFetch = () => {
    fetchBills()
  }

  // Filter bills based on search term
  const filteredBills = bills.filter(bill =>
    bill.bill_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.buyer_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalAmount = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)
  const thisMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.created_at || bill.billing_date)
    const now = new Date()
    return billDate.getMonth() === now.getMonth() &&
      billDate.getFullYear() === now.getFullYear()
  })
  const thisMonthAmount = thisMonthBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-2xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-2xl">
                  <FileText className="w-8 h-8 text-amber-900" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                    Sri Balaji Enterprises
                  </h1>
                  <p className="text-amber-200 text-lg">Professional Bill Management System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center border border-amber-300/30">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-amber-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-amber-600 transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-amber-200/50">
              <h1 className="text-6xl font-bold text-amber-900 mb-6 leading-tight">
                Streamline Your
                <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Billing Process
                </span>
              </h1>
              <p className="text-xl text-amber-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create professional tax invoices, manage clients efficiently, and generate beautiful PDF bills
                with our comprehensive billing solution designed for Sri Balaji Enterprises.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-12 rounded-xl shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300 flex items-center text-lg">
                    <UserPlus className="w-6 h-6 mr-3" />
                    Start Free Trial
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="border-2 border-amber-500 text-amber-600 font-bold py-4 px-12 rounded-xl hover:bg-amber-50 transition-all duration-300 text-lg">
                    Existing User? Sign In
                  </button>
                </SignInButton>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
                <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-lg border border-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <FileText className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">Professional Invoices</h3>
                  <p className="text-amber-700 leading-relaxed">
                    Create GST-compliant tax invoices with automatic tax calculations and professional layouts.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-lg border border-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <User className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">Client Management</h3>
                  <p className="text-amber-700 leading-relaxed">
                    Save and manage client addresses for quick bill generation and repeat business.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 shadow-lg border border-amber-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="bg-amber-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Download className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">PDF Export</h3>
                  <p className="text-amber-700 leading-relaxed">
                    Download high-quality PDF bills for printing, emailing, and record keeping.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-2xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-amber-100 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sri Balaji Enterprises</h1>
                <p className="text-amber-200 text-sm">Bill Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-amber-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-amber-700/30">
                <User className="w-5 h-5 text-amber-200" />
                <span className="text-amber-100">Welcome, {user.firstName || user.username}</span>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border-2 border-amber-300",
                    userButtonTrigger: "bg-amber-100 text-amber-900 hover:bg-amber-200 shadow-lg"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={retryFetch}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
              <p className="text-amber-100 text-lg">
                {bills.length === 0
                  ? "Ready to create your first professional bill?"
                  : `You have ${bills.length} bill${bills.length === 1 ? '' : 's'} in your account`
                }
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => fetchBills(true)}
                disabled={refreshing}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <Link href="/bill-maker">
                <button className="bg-white text-amber-700 font-bold px-8 py-3 rounded-xl hover:bg-amber-50 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg">
                  <Plus className="w-5 h-5" />
                  <span>New Bill</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide">Total Bills</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{bills.length}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{thisMonthBills.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <Link href="/bill-maker">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-semibold uppercase tracking-wide">Quick Action</p>
                  <p className="text-3xl font-bold mt-2">Create Bill</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-5 h-5 text-amber-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bills by number, buyer, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full sm:w-80 bg-amber-50/50"
                />
              </div>
              <button className="bg-amber-100 text-amber-700 px-4 py-3 rounded-xl hover:bg-amber-200 transition-colors flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>
            <div className="text-amber-600 text-sm">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <h2 className="text-2xl font-bold text-amber-900 flex items-center space-x-3">
              <FileText className="w-7 h-7 text-amber-600" />
              <span>Recent Bills</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-amber-600 text-lg">Loading your bills...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-amber-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4">
                {searchTerm ? 'No matching bills found' : 'No bills created yet'}
              </h3>
              <p className="text-amber-700 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Get started by creating your first professional tax invoice.'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/bill-maker"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-3"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Bill</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-amber-900 uppercase tracking-wider">
                      Bill Details
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-amber-900 uppercase tracking-wider">
                      Buyer Info
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-amber-900 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-amber-900 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-amber-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-amber-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="bg-amber-100 p-2 rounded-lg">
                              <FileText className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="font-bold text-amber-900 text-lg">{bill.bill_no}</span>
                          </div>
                          <div className="text-sm text-amber-600">
                            {new Date(bill.created_at || bill.billing_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          {bill.vehicle_number && (
                            <div className="text-xs text-amber-500 mt-1">
                              Vehicle: {bill.vehicle_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <div className="font-medium text-amber-900 mb-1">
                            {bill.buyer_name || 'Unnamed Client'}
                          </div>
                          <div className="text-sm text-amber-700 line-clamp-2">
                            {bill.buyer_address}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-amber-900">{bill.quantity}</span>
                          <span className="text-amber-600 text-sm">bags</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-bold text-amber-900">
                          ₹{bill.total_amount?.toLocaleString()}
                        </div>
                        <div className="text-xs text-amber-600">
                          Tax: ₹{bill.total_tax?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link href={`/bill/${bill.id}`}>
                            <button
                              className="bg-amber-100 text-amber-700 p-3 rounded-xl hover:bg-amber-200 transition-colors duration-200 tooltip"
                              title="View Bill"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </Link>
                          <Link href={`/bill-maker?edit=${bill.id}`}>
                            <button
                              className="bg-blue-100 text-blue-700 p-3 rounded-xl hover:bg-blue-200 transition-colors duration-200 tooltip"
                              title="Edit Bill"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="bg-red-100 text-red-700 p-3 rounded-xl hover:bg-red-200 transition-colors duration-200 tooltip"
                            title="Delete Bill"
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

        {/* Footer */}
        <div className="text-center mt-12 text-amber-600 text-sm">
          <p>© 2024 Sri Balaji Enterprises. Professional Bill Management System.</p>
        </div>
      </div>
    </div>
  )
}