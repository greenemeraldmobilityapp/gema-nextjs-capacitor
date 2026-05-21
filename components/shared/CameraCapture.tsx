'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera, Image as ImageIcon, FlipHorizontal } from 'lucide-react';

interface CameraCaptureProps {
  facingMode: 'user' | 'environment';
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ facingMode, onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mirrored, setMirrored] = useState(facingMode === 'user');

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Izin kamera ditolak. Silakan buka galeri.'
        : 'Kamera tidak tersedia. Silakan buka galeri.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
      },
      'image/jpeg',
      0.92,
    );
  };

  const handleGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onCapture(file);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div className="relative h-full flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X size={22} />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMirrored(!mirrored)}
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              title={mirrored ? 'Matikan mirror' : 'Aktifkan mirror'}
            >
              <FlipHorizontal size={20} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <ImageIcon size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-white">
              <Camera size={40} className="animate-pulse" />
              <p className="text-sm opacity-70">Mengakses kamera...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center gap-4 text-white px-8 text-center">
              <Camera size={48} className="opacity-50" />
              <p className="text-sm">{error}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 px-6 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ImageIcon size={18} />
                Buka Galeri
              </button>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${mirrored ? '-scale-x-100' : ''} ${loading || error ? 'opacity-0' : 'opacity-100'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          {!error && (
            <button
              type="button"
              onClick={capture}
              disabled={loading}
              className="w-20 h-20 rounded-full border-4 border-white/60 flex items-center justify-center hover:border-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryPick}
          className="hidden"
        />
      </div>
    </div>
  );
}
