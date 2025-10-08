import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-amber-700 hover:text-amber-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            Sri Balaji Enterprises
          </h1>
          <p className="text-amber-700">Professional Bill Management System</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900">Welcome Back</h2>
            <p className="text-amber-600 mt-2">Sign in to your account</p>
          </div>
          
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-none bg-transparent",
                headerTitle: "text-amber-900 font-bold text-2xl",
                headerSubtitle: "text-amber-600",
                socialButtonsBlockButton: 
                  "border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors",
                socialButtonsBlockButtonText: "text-amber-700 font-medium",
                dividerLine: "bg-amber-200",
                dividerText: "text-amber-600",
                formFieldLabel: "text-amber-900 font-medium",
                formFieldInput: 
                  "border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-amber-900",
                formButtonPrimary:
                  "bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors",
                footerActionText: "text-amber-600",
                footerActionLink: "text-amber-700 hover:text-amber-900 font-medium",
              },
              variables: {
                colorPrimary: '#d97706',
              }
            }}
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-amber-600">
            Don't have an account?{' '}
            <Link 
              href="/sign-up" 
              className="text-amber-700 hover:text-amber-900 font-semibold underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}