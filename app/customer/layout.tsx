'use client';

import { CustomerBottomNav } from '@/components/shared/CustomerBottomNav';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen pb-16 bg-gray-50">
      <main className="flex-1 w-full max-w-md mx-auto bg-white shadow-sm min-h-screen relative shadow-gray-100">
        {children}
      </main>
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 z-50">
        <CustomerBottomNav />
      </div>
    </div>
  );
}
