'use client';

import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setVisible(true));
      return () => {
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[51] flex items-end justify-center p-4 pb-[72px]">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onCancel}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-auto transition-all duration-200"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <LogOut size={28} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Konfirmasi Keluar
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Apakah Anda yakin ingin keluar dari akun ini?
          </p>
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-12 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors duration-200 shadow-sm"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
