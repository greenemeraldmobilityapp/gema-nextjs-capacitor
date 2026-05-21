'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';

interface ImageLightboxProps {
  images: { image_url: string }[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const wasPinching = useRef(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const goNext = useCallback(() => {
    setCurrent((prev) => Math.min(images.length - 1, prev + 1));
    resetZoom();
  }, [images.length, resetZoom]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => Math.max(0, prev - 1));
    resetZoom();
  }, [resetZoom]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY === 0) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newScale = Math.max(1, Math.min(5, scale + delta));
    if (newScale === scale) return;

    if (newScale > 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const scaleChange = newScale / scale;
        setPosition((prev) => ({
          x: centerX - scaleChange * (centerX - prev.x),
          y: centerY - scaleChange * (centerY - prev.y),
        }));
      }
    } else {
      setPosition({ x: 0, y: 0 });
    }
    setScale(newScale);
  };

  const handleDoubleClick = () => {
    if (scale > 1.5) {
      resetZoom();
    } else {
      setScale(2.5);
      setShowHint(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current || scale <= 1) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    isPanning.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      wasPinching.current = true;
      pinchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    } else if (e.touches.length === 1 && scale > 1) {
      isPanning.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (pinchDist.current > 0) {
        const newScale = Math.max(1, Math.min(5, scale * (dist / pinchDist.current)));
        if (newScale !== scale) {
          setScale(newScale);
          setShowHint(false);
        }
      }
      pinchDist.current = dist;
    } else if (e.touches.length === 1 && isPanning.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const zoomIn = () => {
    const newScale = Math.min(5, scale + 0.5);
    if (newScale !== scale) {
      setScale(newScale);
      setShowHint(false);
    }
  };

  const zoomOut = () => {
    const newScale = Math.max(1, scale - 0.5);
    if (newScale !== scale) {
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      setShowHint(false);
    }
  };

  const handleTouchEnd = () => {
    if (wasPinching.current) {
      wasPinching.current = false;
      pinchDist.current = 0;
      return;
    }
    isPanning.current = false;
    if (scale > 1) return;
    touchEndX.current = touchStartX.current;
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (wasPinching.current || scale > 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Galeri gambar"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Tutup galeri"
      >
        <X size={22} />
      </button>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
        <span>{current + 1}</span>
        <span className="text-white/40">/</span>
        <span className="text-white/60">{images.length}</span>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrent(idx); resetZoom(); }}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === current ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Gambar ${idx + 1}`}
          />
        ))}
      </div>

      {images.length > 1 && current > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden sm:flex"
          aria-label="Sebelumnya"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {images.length > 1 && current < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden sm:flex"
          aria-label="Selanjutnya"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {showHint && scale === 1 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white/70 text-xs pointer-events-none transition-opacity duration-1000">
          Scroll untuk zoom • Klik 2x untuk zoom • Drag untuk pan
        </div>
      )}

      <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); zoomIn(); }}
          disabled={scale >= 5}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:bg-white/30"
          aria-label="Perbesar"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); zoomOut(); }}
          disabled={scale <= 1}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:bg-white/30"
          aria-label="Perkecil"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
          disabled={scale <= 1}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-[11px] font-medium text-white/80 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:bg-white/30"
          aria-label="Reset zoom"
        >
          1:1
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => { handleTouchEnd(); handleSwipeEnd(e); }}
        style={{ touchAction: scale > 1 ? 'none' : 'pan-x pan-y' }}
      >
        <img
          src={images[current].image_url}
          alt={`Gambar ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
          draggable={false}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isPanning.current || wasPinching.current ? 'none' : 'transform 0.15s ease-out',
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
