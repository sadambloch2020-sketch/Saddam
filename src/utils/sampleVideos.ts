/**
 * Generates self-contained sample video blobs or canvas streams
 * so Aapni Gapsap never relies on external 403/broken URLs.
 */

export function createSampleCanvasStream(theme: 'sunset' | 'mountain' | 'food' | 'studio'): {
  canvas: HTMLCanvasElement;
  stream: MediaStream;
  stop: () => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d')!;

  let t = 0;
  let animId: number;

  const draw = () => {
    t += 0.025;
    const w = canvas.width;
    const h = canvas.height;

    // Theme-based background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (theme === 'sunset') {
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#db2777');
      grad.addColorStop(1, '#4f46e5');
    } else if (theme === 'mountain') {
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.4, '#0d9488');
      grad.addColorStop(1, '#1e293b');
    } else if (theme === 'food') {
      grad.addColorStop(0, '#ea580c');
      grad.addColorStop(0.5, '#e11d48');
      grad.addColorStop(1, '#7c2d12');
    } else {
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#f59e0b');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating particles & organic light orbs
    for (let i = 0; i < 7; i++) {
      const ox = w * 0.5 + Math.sin(t * 0.8 + i * 1.1) * (w * 0.38);
      const oy = h * 0.5 + Math.cos(t * 0.6 + i * 0.9) * (h * 0.38);
      const rad = 80 + Math.sin(t + i) * 35;

      const radGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
      radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dynamic wave ripples at bottom
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    for (let x = 0; x <= w; x += 30) {
      const y = h * 0.7 + Math.sin(x * 0.01 + t * 2) * 25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Central circular viewfinder stamp
    ctx.save();
    ctx.translate(w / 2, h / 2 - 50);
    const pulse = 1 + Math.sin(t * 1.5) * 0.05;
    ctx.scale(pulse, pulse);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aapni Gapsap', 0, 10);

    ctx.font = '600 20px sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText(theme.toUpperCase() + ' · LIVE VIBE', 0, 44);
    ctx.restore();

    animId = requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream ? canvas.captureStream(30) : new MediaStream();

  return {
    canvas,
    stream,
    stop: () => cancelAnimationFrame(animId),
  };
}

/**
 * Creates a short valid WebM blob from a canvas animation
 */
export async function generateQuickWebmBlob(theme: 'sunset' | 'mountain' | 'food'): Promise<string> {
  return new Promise((resolve) => {
    try {
      const { stream, stop } = createSampleCanvasStream(theme);
      const chunks: Blob[] = [];

      const mime = MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';

      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stop();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      recorder.start();
      // Record 800ms of loopable dynamic frames
      setTimeout(() => {
        try {
          recorder.stop();
        } catch {
          stop();
          resolve('');
        }
      }, 800);
    } catch {
      resolve('');
    }
  });
}
