'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/lib/services/useNotifications';

interface NotifBellProps {
  href: string;
}

export default function NotifBell({ href }: NotifBellProps) {
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <Link href={href} className="relative group/bell">
      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 group-hover/bell:bg-white/30 group-hover/bell:scale-110">
        <Bell size={20} className="text-white" />
      </div>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
