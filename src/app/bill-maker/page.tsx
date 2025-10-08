import { Suspense } from 'react'
import BillMakerContent from './BillMakerContent'

export default function BillMakerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-amber-700">Loading bill maker...</p>
        </div>
      </div>
    }>
      <BillMakerContent />
    </Suspense>
  )
}