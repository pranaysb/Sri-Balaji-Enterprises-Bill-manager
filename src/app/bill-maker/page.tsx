"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import type { BillFormData, Address, NewAddress, Bill } from "@/types";

export default function BillMaker() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState<BillFormData>({
    bill_no: "",
    billing_date: new Date().toISOString().split("T")[0],
    vehicle_number: "",
    quantity: "",
    total_amount: "",
    buyer_address: "",
    buyer_name: "",
    buyer_gst: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddress>({
    name: "",
    address: "",
    gst_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchAddresses();
      if (editId) {
        fetchBill();
      }
    }
  }, [user, editId]);

  const fetchAddresses = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchBill = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("id", editId as string)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          bill_no: data.bill_no,
          billing_date: data.billing_date.split("T")[0],
          vehicle_number: data.vehicle_number || "",
          quantity: data.quantity.toString(),
          total_amount: data.total_amount.toString(),
          buyer_address: data.buyer_address,
          buyer_name: data.buyer_name || "",
          buyer_gst: data.buyer_gst || "",
        });
      }
    } catch (error) {
      console.error("Error fetching bill:", error);
      setError("Failed to load bill");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

const handleSubmit = async (e: React.FormEvent): Promise<void> => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    // Validate required fields
    if (!formData.bill_no || !formData.billing_date || !formData.quantity || !formData.total_amount || !formData.buyer_address) {
      setError('Please fill all required fields')
      setLoading(false)
      return
    }

    // Use API route instead of direct Supabase call
    const response = await fetch('/api/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        editId: editId || null,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save bill')
    }

    // Success - redirect to dashboard
    router.push('/')
    router.refresh()

  } catch (error: any) {
    console.error('Error saving bill:', error)
    setError(error.message || 'Failed to save bill. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const saveAddress = async (): Promise<void> => {
    if (!newAddress.name || !newAddress.address) {
      setError("Please enter name and address");
      return;
    }

    try {
      const { error } = await supabase.from("addresses").insert([
        {
          ...newAddress,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      setNewAddress({ name: "", address: "", gst_number: "" });
      fetchAddresses();
      setShowAddressModal(false);
    } catch (error: any) {
      setError("Failed to save address: " + error.message);
    }
  };

  const selectAddress = (address: Address): void => {
    setFormData({
      ...formData,
      buyer_address: address.address,
      buyer_name: address.name,
      buyer_gst: address.gst_number || "",
    });
    setShowAddressModal(false);
  };

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-amber-700 hover:text-amber-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-6">
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              {editId ? "Edit Bill" : "Create New Bill"}
            </h1>
            <p className="text-amber-100 mt-2">
              {editId
                ? "Update your bill information"
                : "Fill in the details to create a new tax invoice"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Invoice Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Invoice No *
                </label>
                <input
                  type="text"
                  name="bill_no"
                  value={formData.bill_no}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  placeholder="Enter invoice number"
                />
              </div>

              {/* Billing Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Billing Date *
                </label>
                <input
                  type="date"
                  name="billing_date"
                  value={formData.billing_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-gray-900"
                />
              </div>

              {/* Vehicle Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  placeholder="e.g., KA-01-AB-1234"
                />
              </div>

              {/* Number of Bags */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Number of Bags *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  placeholder="Enter number of bags"
                />
              </div>

              {/* Total Amount */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Total Amount (incl. tax) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                    placeholder="Enter total amount including tax"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Address Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-900">
                  Buyer Address *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  📖 Manage Addresses
                </button>
              </div>
              <textarea
                name="buyer_address"
                value={formData.buyer_address}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900 resize-vertical"
                placeholder="Enter complete buyer address with name, address, city, state, and PIN code..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-8 border-t border-amber-200 space-x-4">
              <Link
                href="/"
                className="px-8 py-3 border-2 border-amber-300 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Bill"
                  : "Generate Bill"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-amber-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4">
              <h3 className="text-2xl font-bold">Address Book</h3>
              <p className="text-amber-100">Select or add a buyer address</p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {/* Saved Addresses */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Addresses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border-2 border-amber-200 rounded-xl p-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 group"
                        onClick={() => selectAddress(address)}
                      >
                        <h4 className="font-bold text-gray-900 group-hover:text-amber-700">
                          {address.name}
                        </h4>
                        <p className="text-sm text-gray-700 mt-2">
                          {address.address}
                        </p>
                        {address.gst_number && (
                          <p className="text-xs text-amber-600 mt-2 font-medium">
                            GST: {address.gst_number}
                          </p>
                        )}
                        <div className="mt-3 text-xs text-amber-500 font-semibold">
                          Click to select
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-amber-600">
                      <p>No saved addresses yet</p>
                      <p className="text-sm mt-1">
                        Add your first address below
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Address */}
              <div className="border-t border-amber-200 pt-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Add New Address
                </h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Buyer Name *"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  />
                  <textarea
                    placeholder="Full Address *"
                    rows={3}
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900 resize-vertical"
                  />
                  <input
                    type="text"
                    placeholder="GST Number (Optional)"
                    value={newAddress.gst_number}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        gst_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-6 py-3 border-2 border-amber-300 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveAddress}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-200"
                  >
                    Save Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
