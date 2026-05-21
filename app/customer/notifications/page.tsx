'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, MessageSquare, Tag, ShieldCheck, Loader2, AlertCircle, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useNotificationsList, useUnreadCount, useMarkAsRead, useMarkAllAsRead, type AppNotification } from '@/lib/services/useNotifications';

const categoryMeta: Record<string, { icon: typeof Bell; color: string }> = {
  order: { icon: Bell, color: 'bg-blue-50 text-blue-600' },
  chat: { icon: MessageSquare, color: 'bg-green-50 text-green-600' },
  promo: { icon: Tag, color: 'bg-orange-50 text-orange-600' },
  system: { icon: ShieldCheck, color: 'bg-purple-50 text-purple-600' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return d.toLocaleDateString('id-ID');
}

function groupByDate(items: AppNotification[]) {
  const groups: Record<string, AppNotification[]> = {};
  for (const item of items) {
    const key = new Date(item.created_at).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function NotifContent() {
  const router = useRouter();
  const { data: notifications, isLoading, error } = useNotificationsList();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotifClick = (notif: AppNotification) => {
    if (!notif.is_read) {
      markAsRead.mutate({ notificationId: notif.id });
    }
    if (notif.url) {
      router.push(notif.url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-red-400">
        <AlertCircle size={32} className="mb-2 opacity-50" />
        <p className="text-sm">Gagal memuat notifikasi</p>
      </div>
    );
  }

  const grouped = notifications ? groupByDate(notifications) : {};

  if (notifications && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Bell size={48} className="mb-3 opacity-30" />
        <p className="text-sm font-medium">Belum ada notifikasi</p>
        <p className="text-xs text-gray-400 mt-1">Notifikasi akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-gray-500 px-1 mb-2">{date}</p>
          <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-gray-100">
              {items.map((notif) => {
                const meta = categoryMeta[notif.category] || { icon: Bell, color: 'bg-gray-50 text-gray-600' };
                const Icon = meta.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${meta.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm ${notif.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                          {notif.title}
                        </h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{formatTime(notif.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-emerald-600 text-white p-4 pt-8 rounded-b-[24px] shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/customer/profile" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-700 hover:bg-emerald-800 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-heading font-bold text-lg flex-1">Notifikasi</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-700/50 hover:bg-emerald-700/70 rounded-full px-3 py-1.5 transition-colors"
            >
              <CheckCheck size={14} />
              Baca Semua
            </button>
          )}
        </div>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
        <NotifContent />
      </Suspense>
    </div>
  );
}
