'use client';

import { Bell, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VendorDashboard() {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 pt-8 pb-12 rounded-b-[32px] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">Hello, Budi!</h1>
            <p className="text-emerald-100 text-sm">Here's your summary today</p>
          </div>
          <div className="relative">
            <Bell size={24} className="text-emerald-50" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-emerald-600" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-6">
        {/* Earnings Card */}
        <Card className="rounded-2xl border-none shadow-md overflow-hidden">
          <CardHeader className="bg-emerald-50 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <TrendingUp size={16} />
              This Month's Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white pt-4 pb-6">
            <div className="text-3xl font-bold text-gray-900">RP 4.500.000</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>+12% vs last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                <Clock size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-500 font-medium">Pending Jobs</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-xs text-gray-500 font-medium">Completed Jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Incoming Orders Alert */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">New Requests</h2>
            <span className="text-sm text-emerald-600 font-medium cursor-pointer">View all</span>
          </div>
          <Card className="rounded-xl border-orange-100 bg-orange-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">Perbaikan AC Bocor</h3>
                  <p className="text-sm text-gray-600">Jl. Melati No 45, Jakarta</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">Rp 150k</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-white text-gray-700 border hover:bg-gray-50" variant="outline">Decline</Button>
                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600">Accept</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
