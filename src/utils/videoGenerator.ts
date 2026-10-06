/**
 * Generates an animated video clip via HTML5 Canvas and MediaRecorder
 * for instant testing when physical camera is unavailable or denied.
 */

export function createSimulatedMediaStream(
  filterName: string = 'Normal',
  caption: string = 'Aapni Gapsap Live'
): { stream: MediaStream; stop: () => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280; // 9:16 vertical short reel aspect ratio
  const ctx = canvas.getContext('2d')!;

  let animationFrameId: number;
  let t = 0;

  // Audio Context for test audio track
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.01, audioCtx.currentTime); // subtle hum
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  const draw = () => {
    t += 0.03;
    const w = canvas.width;
    const h = canvas.height;

    // Background gradient with energetic dynamic motion
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (filterName === 'Bollywood Glow' || filterName === 'Warm Saffron') {
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#8b5cf6');
    } else if (filterName === 'Cyber Neon') {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#a855f7');
    } else if (filterName === 'Monsoon Chill') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0e7490');
    } else {
      // Natural Sunset / Gapsap vibe
      grad.addColorStop(0, '#ea580c');
      grad.addColorStop(0.4, '#db2777');
      grad.addColorStop(1, '#4f46e5');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating dynamic organic lights
    for (let i = 0; i < 6; i++) {
      const x = w / 2 + Math.sin(t + i * 1.2) * (w * 0.35);
      const y = h / 2 + Math.cos(t * 0.8 + i) * (h * 0.35);
      const radius = 90 + Math.sin(t + i) * 30;

      const radial = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines for camera viewfinder aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 3, 0); ctx.lineTo(w / 3, h);
    ctx.moveTo((w * 2) / 3, 0); ctx.lineTo((w * 2) / 3, h);
    ctx.moveTo(0, h / 3); ctx.lineTo(w, h / 3);
    ctx.moveTo(0, (h * 2) / 3); ctx.lineTo(w, (h * 2) / 3);
    ctx.stroke();

    // Central graphic pulse
    ctx.save();
    ctx.translate(w / 2, h / 2 - 80);
    const pulse = 1 + Math.sin(t * 2) * 0.08;
    ctx.scale(pulse, pulse);

    // Camera circle badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Aapni Gapsap Typography inside viewfinder
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Aapni Gapsap', 0, 10);

    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('CAMERA STUDIO', 0, 45);
    ctx.restore();

    // Live timestamp & filter badge
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.roundRect(40, h - 180, w - 80, 100, 16);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`✨ ${caption}`, 60, h - 135);

    ctx.font = '400 18px monospace';
    ctx.fillStyle = '#93c5fd';
    const now = new Date().toLocaleTimeString();
    ctx.fillText(`LIVE · ${filterName} · ${now}`, 60, h - 102);

    animationFrameId = requestAnimationFrame(draw);
  };

  draw();

  const canvasStream = canvas.captureStream(30);
  // Add audio track
  dest.stream.getAudioTracks().forEach(track => canvasStream.addTrack(track));

  const stop = () => {
    cancelAnimationFrame(animationFrameId);
    try {
      osc.stop();
      audioCtx.close();
    } catch {
      // ignore
    }
    canvasStream.getTracks().forEach(t => t.stop());
  };

  return { stream: canvasStream, stop };
}
