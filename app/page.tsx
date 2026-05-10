import Link from 'next/link';

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-emerald-600 mb-8">GEMA</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Welcome to Green Emerald Mobility Apps. Please select your app version:
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link 
          href="/customer/home" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-center py-3 rounded-xl font-medium shadow-sm transition-colors"
        >
          Customer App
        </Link>
        <Link 
          href="/vendor/dashboard" 
          className="bg-white hover:bg-gray-50 text-emerald-600 border border-emerald-200 text-center py-3 rounded-xl font-medium shadow-sm transition-colors"
        >
          Vendor App
        </Link>
      </div>
    </div>
  );
}
