'use client';

import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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

  const isDanger = variant === 'danger';
  const iconClass = isDanger ? 'bg-red-50' : 'bg-emerald-50';
  const iconColor = isDanger ? 'text-red-600' : 'text-emerald-600';
  const IconComponent = isDanger ? Trash2 : AlertTriangle;
  const confirmBtnClass = isDanger
    ? 'w-full h-12 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200 shadow-sm'
    : 'w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors duration-200 shadow-sm';

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
          <div className={`w-16 h-16 rounded-full ${iconClass} flex items-center justify-center mb-4`}>
            <IconComponent size={28} className={iconColor} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full h-12 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`${confirmBtnClass} cursor-pointer`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
