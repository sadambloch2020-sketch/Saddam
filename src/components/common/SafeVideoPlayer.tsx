import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface SafeVideoPlayerRef {
  play: () => Promise<void> | void;
  pause: () => void;
  paused: boolean;
  currentTime: number;
}

interface SafeVideoPlayerProps {
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement | HTMLVideoElement>) => void;
  onPlay?: () => void;
  onPause?: () => void;
  theme?: 'sunset' | 'mountain' | 'food' | 'studio';
  title?: string;
}

export const SafeVideoPlayer = forwardRef<SafeVideoPlayerRef, SafeVideoPlayerProps>(
  (
    {
      src,
      poster,
      autoPlay = false,
      loop = true,
      muted = true,
      playsInline = true,
      controls = false,
      className = '',
      style = {},
      onClick,
      onPlay,
      onPause,
      theme = 'sunset',
      title = 'Aapni Gapsap',
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number | null>(null);

    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    // If src is missing or already failed, mark as error immediately
    useEffect(() => {
      if (!src || src.startsWith('fallback:') || src.startsWith('data:,')) {
        setHasError(true);
      } else {
        setHasError(false);
      }
    }, [src]);

    // Expose standard video-like methods
    useImperativeHandle(ref, () => ({
      play: async () => {
        setIsPlaying(true);
        if (!hasError && videoRef.current) {
          try {
            await videoRef.current.play();
            onPlay?.();
          } catch {
            // Autoplay restriction or source error
            setHasError(true);
          }
        } else {
          onPlay?.();
        }
      },
      pause: () => {
        setIsPlaying(false);
        if (!hasError && videoRef.current) {
          videoRef.current.pause();
        }
        onPause?.();
      },
      get paused() {
        if (!hasError && videoRef.current) {
          return videoRef.current.paused;
        }
        return !isPlaying;
      },
      get currentTime() {
        if (!hasError && videoRef.current) {
          return videoRef.current.currentTime;
        }
        return 0;
      },
      set currentTime(val: number) {
        if (!hasError && videoRef.current) {
          videoRef.current.currentTime = val;
        }
      },
    }));

    // Animated canvas loop for fallback
    useEffect(() => {
      if (!hasError || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let t = 0;
      let running = true;

      const renderFrame = () => {
        if (!running) return;
        if (isPlaying) {
          t += 0.03;
        }

        const w = canvas.width;
        const h = canvas.height;

        // Dynamic background gradient
        const grad = ctx.createLinearGradient(0, 0, w, h);
        if (theme === 'sunset') {
          grad.addColorStop(0, '#ea580c');
          grad.addColorStop(0.4, '#db2777');
          grad.addColorStop(1, '#4f46e5');
        } else if (theme === 'mountain') {
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(0.5, '#0d9488');
          grad.addColorStop(1, '#1e293b');
        } else if (theme === 'food') {
          grad.addColorStop(0, '#c2410c');
          grad.addColorStop(0.5, '#e11d48');
          grad.addColorStop(1, '#7c2d12');
        } else {
          grad.addColorStop(0, '#6366f1');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#f59e0b');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Organic light orbs
        for (let i = 0; i < 5; i++) {
          const ox = w * 0.5 + Math.sin(t * 0.7 + i * 1.3) * (w * 0.35);
          const oy = h * 0.5 + Math.cos(t * 0.5 + i) * (h * 0.35);
          const rad = 70 + Math.sin(t + i) * 30;

          const radGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
          radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(ox, oy, rad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Camera viewfinder overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
        ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
        ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
        ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
        ctx.stroke();

        // Central pulse badge
        ctx.save();
        ctx.translate(w / 2, h / 2 - 40);
        const pulse = 1 + Math.sin(t * 1.8) * 0.04;
        ctx.scale(pulse, pulse);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Aapni Gapsap', 0, 8);

        ctx.font = '600 13px sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText('SHORT CLIP', 0, 28);
        ctx.restore();

        animFrameRef.current = requestAnimationFrame(renderFrame);
      };

      renderFrame();

      return () => {
        running = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [hasError, isPlaying, theme, title]);

    // Handle HTML5 video error
    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      // Prevent error propagation
      e.stopPropagation();
      setHasError(true);
    };

    if (hasError) {
      return (
        <div
          onClick={onClick}
          className={`relative overflow-hidden cursor-pointer ${className}`}
          style={style}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={854}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        controls={controls}
        onError={handleVideoError}
        onPlay={() => {
          setIsPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          setIsPlaying(false);
          onPause?.();
        }}
        onClick={onClick}
        className={className}
        style={style}
      />
    );
  }
);

SafeVideoPlayer.displayName = 'SafeVideoPlayer';
