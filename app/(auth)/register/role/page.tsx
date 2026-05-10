'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Wrench } from 'lucide-react';

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleSelectRole = (role: string) => {
    router.push(`/register?role=${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Join GEMA</h1>
          <p className="text-gray-500">How would you like to use the app?</p>
        </div>

        <div className="grid gap-4">
          <Card 
            className="cursor-pointer hover:border-emerald-500 transition-colors border-2 rounded-[24px]"
            onClick={() => handleSelectRole('customer')}
          >
            <CardHeader className="flex flex-row items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <UserCircle size={28} />
              </div>
              <div>
                <CardTitle className="text-xl">Customer</CardTitle>
                <CardDescription>I want to find and book services</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-emerald-500 transition-colors border-2 rounded-[24px]"
            onClick={() => handleSelectRole('vendor')}
          >
            <CardHeader className="flex flex-row items-center gap-4 py-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Wrench size={28} />
              </div>
              <div>
                <CardTitle className="text-xl">Vendor</CardTitle>
                <CardDescription>I want to provide my services</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
