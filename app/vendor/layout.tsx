'use client';

import { VendorBottomNav } from '@/components/shared/VendorBottomNav';

export default function VendorLayout({
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
        <VendorBottomNav />
      </div>
    </div>
  );
}
