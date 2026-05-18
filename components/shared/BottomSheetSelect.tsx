'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface BottomSheetOption {
  value: string;
  label: string;
}

interface BottomSheetSelectProps {
  value: string;
  onChange: (value: string, label: string) => void;
  options: BottomSheetOption[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}

export default function BottomSheetSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih',
  loading = false,
  disabled = false,
  searchable = false,
}: BottomSheetSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const filtered = useMemo(
    () => (search ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : options),
    [options, search],
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || '';

  return (
    <>
      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className="flex items-center justify-between w-full h-12 bg-stone-50 border border-stone-200 rounded-xl px-4 text-sm transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 outline-none hover:border-stone-300 disabled:bg-stone-100 disabled:cursor-not-allowed"
      >
        <span className={value ? 'text-stone-800 font-medium truncate' : 'text-stone-400 truncate'}>
          {loading ? 'Memuat...' : selectedLabel || placeholder}
        </span>
        <ChevronDown size={18} className="text-stone-400 shrink-0 ml-2" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-elegant pb-8 max-h-[80vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-stone-300" />
            </div>

            <div className="flex items-center justify-between px-6 pb-2 shrink-0">
              <h3 className="text-lg font-bold text-stone-800">{placeholder}</h3>
              <button type="button" onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <X size={16} className="text-stone-500" />
              </button>
            </div>

            {searchable && (
              <div className="px-4 pb-2 shrink-0">
                <div className="flex items-center gap-2 h-11 bg-stone-50 rounded-xl border border-stone-200 px-3">
                  <Search size={16} className="text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
                    autoFocus
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')} className="text-stone-400 hover:text-stone-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-sm text-stone-400">
                  {search ? 'Tidak ditemukan' : 'Tidak ada data'}
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value, opt.label); setOpen(false); }}
                    className={`flex items-center justify-between w-full min-h-12 px-4 rounded-2xl text-sm text-left transition-colors duration-150 ${
                      value === opt.value
                        ? 'text-emerald-600 font-semibold bg-emerald-50'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {value === opt.value && (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 ml-2">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
