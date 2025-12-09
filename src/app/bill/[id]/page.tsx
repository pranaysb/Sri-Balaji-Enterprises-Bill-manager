'use client'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import type { Bill } from '@/types'

// Helper to ensure 2 decimal places in display (e.g., 100.00)
const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '0.00'
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

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

  const downloadPDFAdvanced = async (): Promise<void> => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const billElement = document.getElementById('bill-content')

      if (!billElement) {
        alert('Bill content not found')
        return
      }

      const canvas = await html2canvas(billElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: billElement.scrollWidth,
        height: billElement.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 190
      const pageHeight = 277
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Bill-${bill?.bill_no || 'invoice'}.pdf`)

    } catch (error) {
      console.error('Error generating PDF:', error)
      window.print()
    }
  }

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Rupees Only'

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

    const convertThreeDigits = (n: number): string => {
      if (n === 0) return ''
      let words = ''
      const hundred = Math.floor(n / 100)
      const remainder = n % 100
      if (hundred > 0) {
        words += units[hundred] + ' Hundred'
        if (remainder > 0) words += ' '
      }
      if (remainder > 0) {
        if (remainder < 10) words += units[remainder]
        else if (remainder < 20) words += teens[remainder - 10]
        else {
          words += tens[Math.floor(remainder / 10)]
          if (remainder % 10 > 0) words += ' ' + units[remainder % 10]
        }
      }
      return words
    }

    const convertTwoDigits = (n: number): string => {
      if (n === 0) return ''
      if (n < 10) return units[n]
      if (n < 20) return teens[n - 10]
      return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + units[n % 10] : '')
    }

    const amountStr = num.toFixed(2)
    const [rupeesStr, paiseStr] = amountStr.split('.')

    let rupees = parseInt(rupeesStr)
    let paise = parseInt(paiseStr)

    let words = ''

    if (rupees > 0) {
      if (rupees >= 10000000) {
        const crores = Math.floor(rupees / 10000000)
        words += convertTwoDigits(crores) + ' Crore '
        rupees %= 10000000
      }
      if (rupees >= 100000) {
        const lakhs = Math.floor(rupees / 100000)
        words += convertTwoDigits(lakhs) + ' Lakh '
        rupees %= 100000
      }
      if (rupees >= 1000) {
        const thousandsNum = Math.floor(rupees / 1000)
        words += convertTwoDigits(thousandsNum) + ' Thousand '
        rupees %= 1000
      }
      if (rupees > 0) {
        words += convertThreeDigits(rupees)
      }
      words = words.trim() + ' Rupees'
    } else {
      words = 'Zero Rupees'
    }

    if (paise > 0) {
      words += ' and ' + convertTwoDigits(paise) + ' Paise'
    }

    return words + ' Only'
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAddress = (address: string, name?: string, gstin?: string) => {
    if (!address) return null
    const lines = address.split('\n')
    const formattedLines = []
    if (name) formattedLines.push(name)
    formattedLines.push(...lines)
    if (gstin) formattedLines.push(`GSTIN: ${gstin}`)
    return formattedLines.map((line, index) => (
      <span key={index}>{line}{index < formattedLines.length - 1 && <br />}</span>
    ))
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
          <Link href="/" className="text-amber-600 hover:text-amber-800">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            /* KEY FIX: Setting margin to 0 hides browser headers/footers (URL, Date). 
              We add the margin back to the body below.
            */
            margin: 0 !important;
            size: A4;
          }
          body {
            /* This mimics the page margin so content isn't cut off */
            margin: 10mm !important;
            padding: 0;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .bill-content {
            box-shadow: none !important;
            border: 2px solid #000 !important;
            /* Remove extra margin on the content div since body has it now */
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            background: white !important;
            font-size: 12px !important; 
            line-height: 1.2 !important;
            border-collapse: collapse !important;
          }
          .print-small {
            font-size: 11px !important;
          }
          .addresses-container {
            border: 1px solid #000 !important;
            page-break-inside: avoid !important;
          }
          .address-divider {
            border-right: 1px solid #000 !important;
          }
          p { margin: 0 !important; }
        }
      `}</style>

      <div className="container mx-auto p-4 print:p-0">
        <div className="mb-6 flex justify-center gap-4 print:hidden no-print">
          <Link href="/" className="bg-amber-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-700 transition-all flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button onClick={downloadPDFAdvanced} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Download as PDF
          </button>
          <button onClick={downloadPDF} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Print Version
          </button>
        </div>

        <div id="bill-content" className="bill-content bg-white shadow-xl mx-auto max-w-6xl p-6 border-2 border-gray-800 print:shadow-none print:max-w-none print:p-2">

          <p className="tax-invoice text-center font-bold text-lg mb-4 text-black print:text-sm print:mb-2 border-b-2 border-amber-600 pb-2 print:pb-1">TAX INVOICE</p>

          <div className="main space-y-4 print:space-y-2">

            <div className="seller border-b-2 border-gray-300 pb-4 print:pb-2 print:border-black">
              <div className="flex items-start gap-3">
                <div className="logo-box">
                  <img className="logo w-16 h-16 object-contain border-2 border-gray-600 print:w-12 print:h-12" src="/logo.png" alt="Sri Balaji Enterprises Logo" />
                </div>
                <div className="seller-address text-black text-sm print:text-xs leading-tight">
                  <strong className="text-black text-base print:text-sm">SRI BALAJI ENTERPRISES</strong> <br />
                  #10/60,3rd cross,3rd main, <br />
                  Srinivasnagar, BSK 3rd stage,<br />
                  Bangalore-560085, Karnataka<br />
                  GST IN/UIP :29BAIPS9033A1ZL<br />
                  MOBILE NO:9483949650<br />
                  GMAIL: seelambalaji1969@gmail.com
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
              <div className="lg:col-span-3 print:col-span-3 addresses-container border border-gray-400 print:border-black">
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2">
                  <div className="p-4 print:p-2 border-r border-gray-400 print:border-black address-divider">
                    <strong className="text-black block mb-2 text-sm print:text-xs">Buyer Address</strong>
                    <div className="text-black text-sm print:text-xs whitespace-pre-line leading-tight">
                      {formatAddress(bill.buyer_address, bill.buyer_name, bill.buyer_gst)}
                    </div>
                  </div>
                  <div className="p-4 print:p-2">
                    <strong className="text-black block mb-2 text-sm print:text-xs">
                      {bill.is_same_address ? 'Shipping Address (Same)' : 'Shipping Address'}
                    </strong>
                    <div className="text-black text-sm print:text-xs whitespace-pre-line leading-tight">
                      {formatAddress(bill.shipping_address || bill.buyer_address, bill.shipping_name || bill.buyer_name, bill.shipping_gst || bill.buyer_gst)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-400 print:border-black p-4 print:p-2">
                <div className="space-y-2 print:space-y-1 text-black text-sm print:text-xs">
                  <div className="flex justify-between border-b border-gray-300 print:border-black pb-1 print:pb-0">
                    <div className="left font-semibold">Invoice No:</div>
                    <div className="right font-bold">{bill.bill_no}</div>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 print:border-black pb-1 print:pb-0">
                    <div className="left font-semibold">Date:</div>
                    <div className="right">{formatDate(bill.billing_date)}</div>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 print:border-black pb-1 print:pb-0">
                    <div className="left font-semibold">E way no:</div>
                    <div className="right">{bill.eway_number || 'N/A'}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="left font-semibold">Vehicle No:</div>
                    <div className="right">{bill.vehicle_number || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-400 print:border-black">
              <div className="grid grid-cols-8 gap-1 bg-amber-100 print:bg-gray-200 p-2 print:p-1 font-semibold text-sm text-black print:text-xs text-center print-small">
                <div>Description of Goods</div>
                <div>HSN/SAC</div>
                <div>GST Rate</div>
                <div>Quantity in bags</div>
                <div>Rate</div>
                <div>per</div>
                <div>Amount</div>
              </div>

              <div className="grid grid-cols-8 gap-1 p-2 print:p-1 border-t border-gray-400 print:border-black text-sm text-black print:text-xs text-center print-small">
                <div className="text-left leading-tight">
                  Cement<br />
                  <span className="text-xs">CGST@9%</span><br />
                  <span className="text-xs">SGST@9%</span>
                </div>
                <div>2523</div>
                <div>18%</div>
                <div>{bill.quantity}</div>
                <div>₹{formatCurrency(bill.rate)}</div>
                <div>Bag</div>
                <div className="leading-tight">
                  ₹{formatCurrency(bill.taxless_amount)}<br />
                  ₹{formatCurrency(bill.cgst_amount)}<br />
                  ₹{formatCurrency(bill.sgst_amount)}
                </div>
              </div>

              <div className="grid grid-cols-8 gap-1 p-2 print:p-1 border-t border-gray-400 print:border-black font-semibold bg-amber-50 print:bg-gray-100 text-black print:text-xs text-center print-small">
                <div className="text-left">Total</div>
                <div></div>
                <div></div>
                <div>{bill.quantity}</div>
                <div></div>
                <div></div>
                <div>₹{formatCurrency(bill.total_amount)}</div>
              </div>
            </div>

            <div className="border border-gray-400 print:border-black p-3 print:p-2">
              <div className="text-sm text-black print:text-xs">
                <strong>Amount Chargeable in words: </strong>
                {numberToWords(bill.total_amount)}
              </div>
            </div>

            <div className="border border-gray-400 print:border-black">
              <div className="grid grid-cols-7 gap-1 bg-amber-100 print:bg-gray-200 p-2 print:p-1 font-semibold text-sm text-black print:text-xs text-center print-small">
                <div>HSN/SAC</div>
                <div>Taxable Value</div>
                <div className="col-span-2 text-center border-x border-gray-400 print:border-black">
                  <div>Central Tax</div>
                  <div className="grid grid-cols-2 mt-1 print:mt-0">
                    <div>Rate</div>
                    <div>Amount</div>
                  </div>
                </div>
                <div className="col-span-2 text-center border-r border-gray-400 print:border-black">
                  <div>State Tax</div>
                  <div className="grid grid-cols-2 mt-1 print:mt-0">
                    <div>Rate</div>
                    <div>Amount</div>
                  </div>
                </div>
                <div className="text-center">Total Tax Amount</div>
              </div>

              <div className="grid grid-cols-7 gap-1 p-2 print:p-1 border-t border-gray-400 print:border-black text-sm text-black print:text-xs text-center print-small">
                <div>2523</div>
                <div>₹{formatCurrency(bill.taxless_amount)}</div>
                <div className="col-span-2 border-x border-gray-400 print:border-black">
                  <div className="grid grid-cols-2">
                    <div>9%</div>
                    <div>₹{formatCurrency(bill.cgst_amount)}</div>
                  </div>
                </div>
                <div className="col-span-2 border-r border-gray-400 print:border-black">
                  <div className="grid grid-cols-2">
                    <div>9%</div>
                    <div>₹{formatCurrency(bill.sgst_amount)}</div>
                  </div>
                </div>
                <div>₹{formatCurrency(bill.total_tax)}</div>
              </div>

              <div className="grid grid-cols-7 gap-1 p-2 print:p-1 border-t border-gray-400 print:border-black font-semibold bg-amber-50 print:bg-gray-100 text-black print:text-xs text-center print-small">
                <div>Total</div>
                <div>₹{formatCurrency(bill.taxless_amount)}</div>
                <div className="col-span-2 border-x border-gray-400 print:border-black">
                  <div className="grid grid-cols-2">
                    <div>9%</div>
                    <div>₹{formatCurrency(bill.cgst_amount)}</div>
                  </div>
                </div>
                <div className="col-span-2 border-r border-gray-400 print:border-black">
                  <div className="grid grid-cols-2">
                    <div>9%</div>
                    <div>₹{formatCurrency(bill.sgst_amount)}</div>
                  </div>
                </div>
                <div>₹{formatCurrency(bill.total_tax)}</div>
              </div>
            </div>

            <div className="border border-gray-400 print:border-black p-3 print:p-2">
              <div className="text-sm text-black print:text-xs">
                <strong>Tax amount in words: </strong>
                {numberToWords(bill.total_tax || 0)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-2 border border-gray-400 print:border-black">
              <div className="p-4 print:p-2 border-r border-gray-400 print:border-black">
                <strong className="text-black block mb-2 text-sm print:text-xs">Declaration:</strong>
                <div className="text-black text-sm print:text-[11px] leading-tight">
                  1. 18% Interest will be charged on all invoice not paid within the said time from the date of invoice. <br />
                  2. Goods once sold will not be taken back or exchanged. our responsibility ceases soon after the goods.
                </div>
              </div>
              <div className="p-4 print:p-2">
                <strong className="text-black block mb-2 text-sm print:text-xs">Company's Bank Details:</strong>
                <div className="text-black text-sm print:text-[11px] leading-tight">
                  Sri Balaji Enterprises<br />
                  BankName : AXIS BANK.<br />
                  Branch : Kathriguppe<br />
                  A/c No. :920020056606334<br />
                  IFS Code :UTIB0003190
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 print:gap-2 border border-gray-400 print:border-black">
              <div className="p-4 print:p-2 text-center border-r border-gray-400 print:border-black">
                <div className="mb-2 font-semibold text-black text-sm print:text-xs">Customer's Seal and Signature</div>
                <div className="h-16 print:h-10"></div>
              </div>
              <div className="p-4 print:p-2 text-center">
                <div className="mb-2 font-semibold text-black text-sm print:text-xs">For Sri Balaji Enterprises</div>
                <div className="h-16 print:h-10"></div>
                <div className="mt-2 text-sm text-black print:text-[11px]">Authorised Signatory</div>
              </div>
            </div>

            <div className="text-center border border-gray-400 print:border-black p-4 print:p-2 text-sm text-black print:text-[11px]">
              SUBJECT TO BANGALORE JURISDICTION<br />
              This is a Computer Generated Invoice
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}