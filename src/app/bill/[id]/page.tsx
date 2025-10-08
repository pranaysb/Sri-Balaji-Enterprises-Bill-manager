'use client'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import type { Bill } from '@/types'

export default function BillView() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBill()
    }
  }, [user, params.id])

  const fetchBill = async (): Promise<void> => {
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('id', params.id as string)
      .eq('user_id', user?.id)
      .single()

    if (data) {
      setBill(data)
    }
    setLoading(false)
  }

  const downloadPDF = (): void => {
    window.print()
  }

  const numberToWords = (num: number): string => {
    const words = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
      'Eighteen', 'Nineteen'
    ]
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    if (num === 0) return 'Zero'
    if (num < 20) return words[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + words[num % 10] : '')
    if (num < 1000) return words[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '')
    return 'Amount in words'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h1>
          <Link href="/" className="text-amber-600 hover:text-amber-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="container mx-auto p-4 print:p-0">
        {/* Action Buttons - Hidden when printing */}
        <div className="mb-6 flex justify-center gap-4 print:hidden">
          <Link
            href="/"
            className="bg-amber-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-amber-700 transition-transform transform hover:scale-105 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as PDF
          </button>
        </div>

        {/* Invoice Content */}
        <div className="bg-white shadow-lg mx-auto max-w-4xl p-8 border print:shadow-none text-gray-900">
          <p className="tax-invoice text-center font-bold text-xl mb-8 text-gray-900">TAX INVOICE</p>

          <div className="main">
            <div className="top-div grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="top-left">
                <div className="seller mb-6">
                  <div className="seller-address text-gray-900">
                    <strong className="text-lg text-gray-900">SRI BALAJI ENTERPRISES</strong> <br/>
                    #10/60,3rd cross,3rd main, <br/>
                    Srinivasnagar, BSK 3rd stage,<br/>
                    Bangalore-560085, Karnataka<br/>
                    GST IN/UIP :29BAIPS9033A1ZL<br/>
                    MOBILE NO:9483949650<br/>
                    GMAIL: seelambalaji1969@gmail.com
                  </div>
                </div>
                <div className="buyer text-gray-900">
                  <strong className="text-gray-900">Buyer</strong><br/>
                  <span className="text-gray-900">{bill.buyer_address}</span>
                </div>
              </div>
              
              <div className="top-right space-y-2 text-gray-900">
                <div className="flex justify-between">
                  <div className="text-gray-900">Invoice No:</div>
                  <div className="font-semibold text-gray-900">{bill.bill_no}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-gray-900">Dated:</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(bill.billing_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-gray-900">Vehicle number:</div>
                  <div className="font-semibold text-gray-900">{bill.vehicle_number}</div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="mid-div mb-8">
              <div className="content-heads grid grid-cols-8 gap-2 bg-amber-100 p-2 font-semibold text-sm text-gray-900">
                <div>Sl.No.</div>
                <div className="col-span-2">Description of Goods</div>
                <div>HSN/SAC</div>
                <div>GST Rate</div>
                <div>Quantity</div>
                <div>Rate</div>
                <div>per</div>
                <div>Amount</div>
              </div>
              
              <div className="content grid grid-cols-8 gap-2 p-2 border-b text-sm text-gray-900">
                <div>1</div>
                <div className="col-span-2">
                  Cement<br/><br/><br/><br/>
                  CGST@14% <br/>SGST@14%
                </div>
                <div>2523</div>
                <div>28%</div>
                <div>{bill.quantity}</div>
                <div>₹{bill.rate}</div>
                <div>Bag</div>
                <div>
                  ₹{bill.taxless_amount}<br/><br/><br/><br/>
                  ₹{bill.cgst_amount}<br/>
                  ₹{bill.sgst_amount}
                </div>
              </div>
              
              <div className="total grid grid-cols-8 gap-2 p-2 font-semibold bg-amber-50 text-gray-900">
                <div></div>
                <div className="col-span-2">Total</div>
                <div></div>
                <div></div>
                <div>{bill.quantity}</div>
                <div></div>
                <div></div>
                <div>₹{bill.total_amount}</div>
              </div>
              
              <div className="total-words mt-4 text-sm text-gray-900">
                Amount Chargeable in words: {numberToWords(Math.round(bill.total_amount))} Rupees Only
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="tax-div mb-8">
              <div className="tax-head grid grid-cols-6 gap-2 bg-amber-100 p-2 font-semibold text-sm text-gray-900">
                <div>HSN/SAC</div>
                <div>Taxable Value</div>
                <div className="col-span-2 text-center">Central Tax</div>
                <div className="col-span-2 text-center">State Tax</div>
              </div>
              
              <div className="tax-hsn grid grid-cols-6 gap-2 p-2 border-b text-sm text-gray-900">
                <div>2523</div>
                <div>₹{bill.taxless_amount}</div>
                <div>14%</div>
                <div>₹{bill.cgst_amount}</div>
                <div>14%</div>
                <div>₹{bill.sgst_amount}</div>
              </div>
              
              <div className="tax-total grid grid-cols-6 gap-2 p-2 font-semibold bg-amber-50 text-gray-900">
                <div>Total</div>
                <div>₹{bill.taxless_amount}</div>
                <div></div>
                <div>₹{bill.cgst_amount}</div>
                <div></div>
                <div>₹{bill.sgst_amount}</div>
              </div>
            </div>

            <div className="tax-words text-sm mb-8 text-gray-900">
              Tax amount in words: {numberToWords(Math.round(bill.total_tax))} Rupees Only
            </div>

            {/* Footer */}
            <div className="bottom-div border-t pt-8 text-gray-900">
              <div className="declaration grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <strong className="text-gray-900">Declaration:</strong><br/>
                  <span className="text-gray-900">
                    1. 18% Interest will be charged on all invoice not paid within the said time from the date of invoice. <br/>
                    2. Goods once sold will not be taken back or exchanged. our responsibility ceases soon after the goods.
                  </span>
                </div>
                <div>
                  <strong className="text-gray-900">Company's Bank Details:</strong><br/>
                  <span className="text-gray-900">
                    BankName : AXIS BANK.<br/>
                    A/c No. :920020056606334<br/>
                    Branch & IFS Code :UTIB0003190
                  </span>
                </div>
              </div>
              
              <div className="sign-seal grid grid-cols-2 gap-8 text-sm text-gray-900">
                <div className="cust-sign text-center">
                  Customer's Seal and Signature
                </div>
                <div className="seller-sign text-center">
                  For Sri Balaji Enterprises
                  <br/><br/><br/><br/>
                  Authorised Signatory
                </div>
              </div>
            </div>
            
            <p className="conclusion text-center text-sm mt-8 border-t pt-4 text-gray-900">
              SUBJECT TO BANGALORE JURISDICTION<br/>
              This is a Computer Generated Invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}