import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Trump Blocker Logo" className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join Trump Blocker
          </h2>
          <p className="text-gray-600">
            Create your account to start blocking unwanted content
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            afterSignUpUrl="/dashboard"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
                card: 'shadow-lg border border-gray-200',
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}