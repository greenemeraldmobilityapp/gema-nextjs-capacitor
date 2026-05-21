'use client';

import { ArrowLeft, Plus, Trash2, Save, Loader2, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useVendorOperatingHours, useUpdateOperatingHours, useVendorDateBlocks, useAddDateBlock, useRemoveDateBlock, useUpdateVendorOnlineStatus } from '@/lib/services/useVendors';
import { createClient } from '@/lib/supabase/client';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SchedulePage() {
  const profile = useAuthStore((s) => s.profile);
  const [isOnline, setIsOnline] = useState(false);
  const { data: hours, isLoading: hoursLoading } = useVendorOperatingHours(profile?.id);
  const { data: dateBlocks, isLoading: blocksLoading } = useVendorDateBlocks(profile?.id);
  const updateHours = useUpdateOperatingHours();
  const addBlock = useAddDateBlock();
  const removeBlock = useRemoveDateBlock();
  const updateOnline = useUpdateVendorOnlineStatus();

  const [localHours, setLocalHours] = useState<{ dayOfWeek: number; openTime: string; closeTime: string; isActive: boolean }[]>([]);
  const [newBlockDate, setNewBlockDate] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      if (!profile?.id) return;
      const supabase = createClient();
      const { data } = await supabase.from('users').select('is_online').eq('id', profile.id).single();
      if (data) setIsOnline(data.is_online ?? false);
    };
    fetchStatus();
  }, [profile?.id]);

  useEffect(() => {
    if (hours) {
      setLocalHours(hours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isActive: h.isActive,
      })));
    } else if (!hoursLoading) {
      setLocalHours(DAY_NAMES.map((_, i) => ({
        dayOfWeek: i,
        openTime: '08:00',
        closeTime: '17:00',
        isActive: i !== 0 && i !== 6,
      })));
    }
  }, [hours, hoursLoading]);

  const toggleDay = (dayOfWeek: number) => {
    setLocalHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, isActive: !h.isActive } : h
    ));
  };

  const updateTime = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setLocalHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
  };

  const handleSave = () => {
    if (!profile?.id) return;
    updateHours.mutate(
      { vendorId: profile.id, hours: localHours },
      { onSuccess: () => toast.success('Jadwal tersimpan') }
    );
  };

  const handleAddBlock = () => {
    if (!profile?.id || !newBlockDate) return;
    addBlock.mutate(
      { vendorId: profile.id, blockedDate: newBlockDate },
      { onSuccess: () => { toast.success('Tanggal libur ditambahkan'); setNewBlockDate(''); } }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 pt-8 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/vendor/settings" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="font-heading font-bold text-lg text-gray-900">Atur Jadwal</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Power className="w-5 h-5 text-emerald-500" />
            ) : (
              <PowerOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-gray-900">Status Online</p>
              <p className="text-sm text-gray-500">{isOnline ? 'Menerima pesanan baru' : 'Tidak menerima pesanan'}</p>
            </div>
          </div>
          <button
            onClick={() => profile?.id && updateOnline.mutate({ userId: profile.id, isOnline: !isOnline })}
            className={`relative h-8 w-16 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${isOnline ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Jam Operasional</h2>
          {hoursLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <div className="space-y-3">
              {localHours.map((h) => (
                <div key={h.dayOfWeek} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => toggleDay(h.dayOfWeek)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${h.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${h.isActive ? 'bg-white' : 'bg-gray-400'}`} />
                  </button>
                  <span className="w-16 text-sm font-medium text-gray-700">{DAY_NAMES[h.dayOfWeek].slice(0, 3)}</span>
                  {h.isActive ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => updateTime(h.dayOfWeek, 'openTime', e.target.value)}
                        className="h-9 rounded-lg text-sm w-28"
                      />
                      <span className="text-gray-400">—</span>
                      <Input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => updateTime(h.dayOfWeek, 'closeTime', e.target.value)}
                        className="h-9 rounded-lg text-sm w-28"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 flex-1">Libur</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={handleSave}
            disabled={updateHours.isPending || hoursLoading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium mt-4 flex items-center justify-center gap-2"
          >
            {updateHours.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Jadwal
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Tanggal Libur</h2>
          {blocksLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <div className="space-y-2">
              {(dateBlocks || []).map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {new Date(block.blockedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {block.reason && <p className="text-xs text-red-600 mt-0.5">{block.reason}</p>}
                  </div>
                  <button
                    onClick={() => removeBlock.mutate({ id: block.id, vendorId: profile?.id || '' })}
                    className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(dateBlocks || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada tanggal libur</p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            <Input
              type="date"
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 h-12 rounded-xl"
            />
            <Button
              onClick={handleAddBlock}
              disabled={!newBlockDate || addBlock.isPending}
              className="h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
