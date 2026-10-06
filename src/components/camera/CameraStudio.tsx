import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Mic,
  MicOff,
  Music,
  Check,
  AlertCircle,
  Play,
  RotateCcw,
  Download,
  Sparkles,
  Layers,
  Clock,
  Compass,
  ChevronLeft,
  ChevronRight,
  Scissors,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEngine } from '../../utils/audioSynthesizer';
import { createSimulatedMediaStream } from '../../utils/videoGenerator';
import { SAMPLE_AUDIO_TRACKS } from '../../data/initialData';
import { PublishModal } from './PublishModal';

export type FilterType =
  | 'normal'
  | 'grayscale'
  | 'sepia'
  | 'vivid'
  | 'saffron'
  | 'golden'
  | 'cyber'
  | 'vintage'
  | 'cool';

export interface VideoFilter {
  id: FilterType;
  name: string;
  badge: string;
  css: string;
  canvasFilter: string;
  previewBg: string;
  description: string;
}

const FILTERS: VideoFilter[] = [
  {
    id: 'normal',
    name: 'Normal',
    badge: 'RAW',
    css: 'none',
    canvasFilter: 'none',
    previewBg: 'from-slate-700 to-slate-500',
    description: 'Natural unfiltered stream',
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    badge: 'B&W',
    css: 'grayscale(100%) contrast(125%) brightness(95%)',
    canvasFilter: 'grayscale(100%) contrast(1.25) brightness(0.95)',
    previewBg: 'from-zinc-900 to-zinc-400',
    description: 'Classic monochrome Noir',
  },
  {
    id: 'sepia',
    name: 'Sepia',
    badge: 'RETRO',
    css: 'sepia(90%) contrast(105%) brightness(95%)',
    canvasFilter: 'sepia(0.9) contrast(1.05) brightness(0.95)',
    previewBg: 'from-amber-900 to-amber-300',
    description: 'Nostalgic vintage warmth',
  },
  {
    id: 'vivid',
    name: 'Vivid',
    badge: 'POP',
    css: 'saturate(180%) contrast(118%) brightness(105%)',
    canvasFilter: 'saturate(1.8) contrast(1.18) brightness(1.05)',
    previewBg: 'from-rose-500 via-amber-400 to-emerald-400',
    description: 'Punchy high-definition colors',
  },
  {
    id: 'saffron',
    name: 'Warm Saffron',
    badge: 'DESI',
    css: 'contrast(110%) saturate(145%) sepia(25%) hue-rotate(-15deg)',
    canvasFilter: 'contrast(1.1) saturate(1.45) sepia(0.25) hue-rotate(-15deg)',
    previewBg: 'from-amber-600 via-orange-500 to-rose-500',
    description: 'Subcontinent golden sunset tone',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    badge: 'GLOW',
    css: 'contrast(105%) brightness(110%) sepia(30%) saturate(135%)',
    canvasFilter: 'contrast(1.05) brightness(1.1) sepia(0.3) saturate(1.35)',
    previewBg: 'from-amber-400 to-yellow-200',
    description: 'Luminous magic-hour glow',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    badge: 'NEON',
    css: 'contrast(135%) saturate(180%) hue-rotate(85deg)',
    canvasFilter: 'contrast(1.35) saturate(1.8) hue-rotate(85deg)',
    previewBg: 'from-cyan-400 via-indigo-600 to-pink-500',
    description: 'Electrifying nightlife contrast',
  },
  {
    id: 'vintage',
    name: 'Vintage 90s',
    badge: 'VHS',
    css: 'sepia(40%) contrast(90%) brightness(105%) saturate(120%)',
    canvasFilter: 'sepia(0.4) contrast(0.9) brightness(1.05) saturate(1.2)',
    previewBg: 'from-violet-700 to-amber-500',
    description: 'Nostalgic tape aesthetic',
  },
  {
    id: 'cool',
    name: 'Cool Teal',
    badge: 'CHILL',
    css: 'hue-rotate(170deg) saturate(130%) contrast(110%)',
    canvasFilter: 'hue-rotate(170deg) saturate(1.3) contrast(1.1)',
    previewBg: 'from-teal-600 to-blue-400',
    description: 'Cinematic cool mood tones',
  },
];

export const CameraStudio: React.FC = () => {
  const { isCameraOpen, closeCamera, cameraMode, showToast, userLocation } = useApp();

  // Media streams & recording
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal');
  const [cameraStatus, setCameraStatus] = useState<'initializing' | 'ready' | 'recording' | 'preview' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulatedCamera, setIsSimulatedCamera] = useState(false);

  // Recording timing & controls
  const [maxDuration, setMaxDuration] = useState<15 | 30 | 60>(15);
  const [countdownSetting, setCountdownSetting] = useState<0 | 3 | 5>(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Audio track backing
  const [selectedBgmId, setSelectedBgmId] = useState<string | null>(null);
  const [showBgmPicker, setShowBgmPicker] = useState(false);
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  // Recorded clip output
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'video' | 'image'>('video');
  const [shutterMode, setShutterMode] = useState<'video' | 'photo'>('video');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);
  const [previewMuted, setPreviewMuted] = useState(false);

  // Video Trimming State (Preview Screen)
  const [isTrimmerOpen, setIsTrimmerOpen] = useState(true);
  const [clipDuration, setClipDuration] = useState<number>(15);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(15);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);

  // Publish modal
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  // Audio level visualizer
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // HUD filter notification banner
  const [hudNotification, setHudNotification] = useState<string | null>(null);
  const hudTimeoutRef = useRef<number | null>(null);
  const activeFilterRef = useRef<VideoFilter>(FILTERS[0]);
  const canvasAnimationRef = useRef<number | null>(null);
  const recordedFilterRef = useRef<VideoFilter>(FILTERS[0]);

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulatedStopRef = useRef<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop current active stream tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (simulatedStopRef.current) {
      simulatedStopRef.current();
      simulatedStopRef.current = null;
    }
  }, [stream]);

  // Initialize camera using MediaDevices API
  const startCamera = useCallback(async (facing: 'user' | 'environment', mic: boolean) => {
    setCameraStatus('initializing');
    setErrorMessage(null);
    setIsSimulatedCamera(false);

    // Ensure previous stream is cleared
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera MediaDevices API is not supported in this browser environment.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9 / 16 },
        },
        audio: mic,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setCameraStatus('ready');

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = newStream;
      }

      // Setup audio analyzer for volume meter
      if (mic && newStream.getAudioTracks().length > 0) {
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const actx = new AudioContextClass();
          const srcNode = actx.createMediaStreamSource(newStream);
          const analyser = actx.createAnalyser();
          analyser.fftSize = 64;
          srcNode.connect(analyser);

          audioContextRef.current = actx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
            }
            animationFrameRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch {
          // Non-blocking analyzer failure
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      let msg = error.message || 'Could not access camera.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera access in your browser or use the Demo Camera.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone hardware found on this device.';
      } else if (error.name === 'NotReadableError') {
        msg = 'Camera is in use by another application.';
      }
      setErrorMessage(msg);
      setCameraStatus('error');
    }
  }, [stream]);

  // Start simulated interactive stream for fallback
  const startSimulatedCamera = useCallback(() => {
    stopStream();
    setErrorMessage(null);
    setIsSimulatedCamera(true);

    const { stream: simStream, stop: simStop } = createSimulatedMediaStream(
      FILTERS.find((f) => f.id === activeFilter)?.name || 'Warm Saffron',
      'Aapni Gapsap Studio Clip'
    );
    simulatedStopRef.current = simStop;
    setStream(simStream);
    setCameraStatus('ready');

    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = simStream;
    }
    showToast('Demo interactive camera stream activated!');
  }, [activeFilter, stopStream, showToast]);

  // Open camera on modal mount
  useEffect(() => {
    if (isCameraOpen) {
      startCamera(facingMode, isMicEnabled);
    }
    return () => {
      stopStream();
      soundEngine.stopBgmTrack();
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [isCameraOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flip camera between front / rear
  const handleFlipCamera = () => {
    soundEngine.playBeep(600, 0.05);
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (!isSimulatedCamera) {
      startCamera(nextMode, isMicEnabled);
    }
  };

  // Toggle mic
  const handleToggleMic = () => {
    soundEngine.playBeep(isMicEnabled ? 400 : 700, 0.05);
    const nextMic = !isMicEnabled;
    setIsMicEnabled(nextMic);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = nextMic;
      });
    }
  };

  // Handle real-time filter selection (toggled before or during recording)
  const handleFilterSelect = (filterId: FilterType) => {
    const chosen = FILTERS.find((f) => f.id === filterId) || FILTERS[0];
    setActiveFilter(filterId);
    activeFilterRef.current = chosen;
    soundEngine.playBeep(640, 0.04);
    setHudNotification(`${chosen.name} (${chosen.badge})`);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = window.setTimeout(() => setHudNotification(null), 1200);
  };

  // Quick cycle through filters (Next / Prev)
  const handleCycleFilter = (direction: 'next' | 'prev') => {
    const currentIndex = FILTERS.findIndex((f) => f.id === activeFilter);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % FILTERS.length
        : (currentIndex - 1 + FILTERS.length) % FILTERS.length;
    handleFilterSelect(FILTERS[nextIndex].id);
  };

  // Trimming Handlers
  const handleTrimStartChange = (val: number) => {
    const clamped = Math.max(0, Math.min(val, trimEnd - 0.5));
    setTrimStart(clamped);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = clamped;
    }
  };

  const handleTrimEndChange = (val: number) => {
    const clamped = Math.min(clipDuration, Math.max(val, trimStart + 0.5));
    setTrimEnd(clamped);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = clamped;
    }
  };

  const handleResetTrim = () => {
    setTrimStart(0);
    setTrimEnd(clipDuration);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = 0;
    }
    showToast('Trim range reset to full clip');
  };

  const formatTimestamp = (sec: number) => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remainder = (s % 60).toFixed(1);
    return `${m < 10 ? '0' : ''}${m}:${parseFloat(remainder) < 10 ? '0' : ''}${remainder}`;
  };

  // Handle soundtrack toggle
  const handleSelectBgm = (trackId: string | null) => {
    setSelectedBgmId(trackId);
    setShowBgmPicker(false);
    if (!trackId) {
      soundEngine.stopBgmTrack();
      return;
    }
    const track = SAMPLE_AUDIO_TRACKS.find((t) => t.id === trackId);
    if (track) {
      soundEngine.startBgmTrack(track.preset);
      showToast(`Audio attached: ${track.title}`);
    }
  };

  // Start recording actual clip
  const executeRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    recordedFilterRef.current = activeFilterRef.current;
    soundEngine.playRecordStart();

    // Select suitable MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    let selectedMime = '';
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        selectedMime = m;
        break;
      }
    }

    // Try canvas-based stream so any filter toggled mid-recording is baked into frames
    let recordingStream = stream;
    if (typeof HTMLCanvasElement.prototype.captureStream === 'function' && liveVideoRef.current) {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 720;
        offCanvas.height = 1280;
        const oCtx = offCanvas.getContext('2d');
        const vEl = liveVideoRef.current;

        if (oCtx) {
          const drawLoop = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              try {
                oCtx.filter = activeFilterRef.current.canvasFilter;
                if (facingMode === 'user' && !isSimulatedCamera) {
                  oCtx.save();
                  oCtx.scale(-1, 1);
                  oCtx.drawImage(vEl, -720, 0, 720, 1280);
                  oCtx.restore();
                } else {
                  oCtx.drawImage(vEl, 0, 0, 720, 1280);
                }
              } catch {
                // Ignore frame draw error
              }
              canvasAnimationRef.current = requestAnimationFrame(drawLoop);
            }
          };
          drawLoop();

          const cStream = offCanvas.captureStream(30);
          stream.getAudioTracks().forEach((track) => cStream.addTrack(track));
          recordingStream = cStream;
        }
      } catch {
        recordingStream = stream;
      }
    }

    try {
      const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(recordingStream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (canvasAnimationRef.current) {
          cancelAnimationFrame(canvasAnimationRef.current);
          canvasAnimationRef.current = null;
        }
        const type = selectedMime || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        const finalSec = Math.max(1, elapsed || recordingSeconds || 15);
        setClipDuration(finalSec);
        setTrimStart(0);
        setTrimEnd(finalSec);
        setCurrentPlayTime(0);
        setIsTrimmerOpen(true);
        setCameraStatus('preview');
        soundEngine.playRecordStop();
        soundEngine.stopBgmTrack();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // collect chunks every 250ms
      setCameraStatus('recording');
      setRecordingSeconds(0);

      // Start elapsed timer
      let elapsed = 0;
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = window.setInterval(() => {
        elapsed += 1;
        setRecordingSeconds(elapsed);
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    } catch {
      showToast('Error initializing MediaRecorder. Trying fallback...');
    }
  };

  // Trigger recording (with countdown if enabled)
  const handleStartRecording = () => {
    if (countdownSetting === 0) {
      executeRecording();
    } else {
      setCameraStatus('ready');
      setCountdownRemaining(countdownSetting);
      soundEngine.playBeep(700, 0.08);

      let current = countdownSetting;
      const interval = setInterval(() => {
        current -= 1;
        if (current > 0) {
          setCountdownRemaining(current);
          soundEngine.playBeep(700, 0.08);
        } else {
          clearInterval(interval);
          setCountdownRemaining(null);
          executeRecording();
        }
      }, 1000);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (canvasAnimationRef.current) {
      cancelAnimationFrame(canvasAnimationRef.current);
      canvasAnimationRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Discard and retake
  const handleRetake = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordedBlob(null);
    setCapturedMediaType('video');
    setCameraStatus('ready');
    setRecordingSeconds(0);
    setTrimStart(0);
    setTrimEnd(15);
    setClipDuration(15);
    setCurrentPlayTime(0);
    if (isSimulatedCamera) {
      startSimulatedCamera();
    } else {
      startCamera(facingMode, isMicEnabled);
    }
  };

  // Download recorded video or photo
  const handleDownloadClip = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    const isImg = capturedMediaType === 'image';
    a.download = `AapniGapsap_${Date.now()}.${isImg ? 'jpg' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(isImg ? 'Photo saved to your device! 📥' : 'Video clip saved to your device! 📥');
  };

  // Snap photo snapshot from live viewfinder
  const handleSnapPhoto = () => {
    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 720;
      snapCanvas.height = 1280;
      const ctx = snapCanvas.getContext('2d');
      if (!ctx) return;

      // Apply current active visual filter
      ctx.filter = activeFilterRef.current.canvasFilter;

      if (liveVideoRef.current && liveVideoRef.current.videoWidth > 0) {
        if (facingMode === 'user' && !isSimulatedCamera) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(liveVideoRef.current, -720, 0, 720, 1280);
          ctx.restore();
        } else {
          ctx.drawImage(liveVideoRef.current, 0, 0, 720, 1280);
        }
      } else {
        // Fallback artistic canvas for demo mode
        const grad = ctx.createLinearGradient(0, 0, 720, 1280);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.5, '#f43f5e');
        grad.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 1280);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Aapni Gapsap Live Snapshot', 360, 620);
        ctx.font = '600 22px sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`${activeFilterRef.current.name.toUpperCase()} FILTER`, 360, 670);
      }

      snapCanvas.toBlob((blob) => {
        if (blob) {
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
          setCapturedMediaType('image');
          recordedFilterRef.current = activeFilterRef.current;
          setTrimStart(0);
          setTrimEnd(5);
          setClipDuration(5);
          setIsTrimmerOpen(false);
          setCameraStatus('preview');
          soundEngine.playRecordStart();
          showToast(`Photo snapshot captured with ${activeFilterRef.current.name}! 📸`);
        }
      }, 'image/jpeg', 0.95);
    } catch {
      showToast('Error taking photo snapshot');
    }
  };

  // Video or Photo file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      const url = URL.createObjectURL(file);
      setRecordedBlob(file);
      setRecordedVideoUrl(url);
      setCapturedMediaType(isImg ? 'image' : 'video');
      setTrimStart(0);
      setTrimEnd(15);
      setClipDuration(15);
      setCurrentPlayTime(0);
      setIsTrimmerOpen(!isImg);
      setCameraStatus('preview');
      showToast(isImg ? 'Photo imported successfully! 📸' : 'Video clip imported successfully! 📹');
    }
  };

  const currentFilterObj = FILTERS.find((f) => f.id === activeFilter) || FILTERS[0];
  const progressRatio = recordingSeconds / maxDuration;

  if (!isCameraOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopStream();
              soundEngine.stopBgmTrack();
              closeCamera();
            }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            title="Close Camera"
            aria-label="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-white text-xs font-medium tracking-tight bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="capitalize">{cameraMode} Mode</span>
          </div>
        </div>

        {/* Status / Selected Sound / Audio Meter */}
        <div className="flex items-center gap-2">
          {cameraStatus === 'ready' && (
            <>
              {/* Backing Music Selector Button */}
              <button
                onClick={() => setShowBgmPicker(!showBgmPicker)}
                className={`h-9 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors ${
                  selectedBgmId
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Add Soundtrack Beat"
              >
                <Music className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">
                  {selectedBgmId
                    ? SAMPLE_AUDIO_TRACKS.find((t) => t.id === selectedBgmId)?.title
                    : 'Add Music'}
                </span>
              </button>

              {/* Timer Duration Switcher (15s / 30s / 60s) */}
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-0.5 text-xs text-white">
                {([15, 30, 60] as const).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => setMaxDuration(dur)}
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      maxDuration === dur ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {dur}s
                  </button>
                ))}
              </div>
            </>
          )}

          {cameraStatus === 'recording' && (
            <div className="bg-rose-600/90 text-white text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:
              {maxDuration}
            </div>
          )}
        </div>
      </header>

      {/* Main Viewfinder / Media Frame */}
      <div className="relative w-full h-full max-w-md mx-auto bg-black flex items-center justify-center overflow-hidden">
        {/* LIVE CAMERA VIEW */}
        {cameraStatus !== 'preview' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Live Video element */}
            {(cameraStatus === 'ready' || cameraStatus === 'recording') && (
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                onError={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                style={{ filter: currentFilterObj.css }}
                className={`w-full h-full object-cover ${facingMode === 'user' && !isSimulatedCamera ? 'scale-x-[-1]' : ''}`}
              />
            )}

            {/* Filter Switch HUD Notification */}
            {hudNotification && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-black/85 backdrop-blur-md border border-amber-400/40 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{hudNotification}</span>
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdownRemaining !== null && (
              <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
                <span className="text-8xl font-black text-amber-400 animate-bounce drop-shadow-2xl">
                  {countdownRemaining}
                </span>
              </div>
            )}

            {/* Top recording progress line */}
            {cameraStatus === 'recording' && (
              <div className="absolute top-14 left-4 right-4 z-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 transition-all duration-300 ease-linear"
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
            )}

            {/* Realtime Audio Wave / Level Meter (subtle bar at bottom right) */}
            {isMicEnabled && cameraStatus !== 'error' && (
              <div className="absolute bottom-28 right-4 z-20 flex items-end gap-0.5 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/10">
                <Mic className="w-3 h-3 text-emerald-400 mr-1 self-center" />
                <div className="w-1 bg-emerald-500 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.2)}px` }} />
                <div className="w-1 bg-emerald-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, audioLevel * 0.35)}px` }} />
                <div className="w-1 bg-emerald-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, audioLevel * 0.15)}px` }} />
              </div>
            )}

            {/* Simulated Stream Notice Badge */}
            {isSimulatedCamera && (
              <div className="absolute top-16 left-4 z-20 bg-amber-500/90 text-slate-950 font-semibold text-[11px] px-2.5 py-1 rounded-md shadow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Simulated Camera Active
              </div>
            )}

            {/* Location Pill if available */}
            {userLocation && (
              <div className="absolute top-16 right-4 z-20 bg-black/50 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[120px]">{userLocation.name}</span>
              </div>
            )}

            {/* ERROR / PERMISSION DENIED CARD */}
            {cameraStatus === 'error' && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Camera Access Needed</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                  {errorMessage || 'Browser camera access was restricted or blocked.'}
                </p>

                <div className="flex flex-col gap-2.5 w-full max-w-xs">
                  <button
                    onClick={startSimulatedCamera}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    Use Interactive Demo Camera
                  </button>

                  <button
                    onClick={() => startCamera(facingMode, isMicEnabled)}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Camera Permission
                  </button>

                  <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer text-center">
                    Upload Video File
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODE (Playback after recording or Photo Snapshot) */}
        {cameraStatus === 'preview' && recordedVideoUrl && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {capturedMediaType === 'image' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
                <img
                  src={recordedVideoUrl}
                  alt="Captured Snapshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-16 left-4 z-20 flex items-center gap-2">
                  <div className="bg-amber-500 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Photo Snapshot
                  </div>
                  <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/15">
                    {recordedFilterRef.current.name}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={previewVideoRef}
                  src={recordedVideoUrl}
                  autoPlay
                  playsInline
                  loop
                  muted={previewMuted}
                  onLoadedMetadata={() => {
                    if (previewVideoRef.current) {
                      const d = previewVideoRef.current.duration;
                      if (d && !isNaN(d) && isFinite(d) && d > 0) {
                        setClipDuration(d);
                        setTrimEnd(d);
                      }
                    }
                  }}
                  onTimeUpdate={() => {
                    if (previewVideoRef.current) {
                      const cur = previewVideoRef.current.currentTime;
                      setCurrentPlayTime(cur);
                      if (cur >= trimEnd) {
                        previewVideoRef.current.currentTime = trimStart;
                        if (!previewVideoRef.current.paused) {
                          previewVideoRef.current.play().catch(() => {});
                        }
                      } else if (cur < trimStart) {
                        previewVideoRef.current.currentTime = trimStart;
                      }
                    }
                  }}
                  onError={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onPlay={() => setIsPreviewPlaying(true)}
                  onPause={() => setIsPreviewPlaying(false)}
                  className="w-full h-full object-cover"
                />

                {/* Floating Play/Pause Touch Target */}
                <button
                  onClick={() => {
                    if (previewVideoRef.current) {
                      if (previewVideoRef.current.paused) {
                        previewVideoRef.current.play();
                      } else {
                        previewVideoRef.current.pause();
                      }
                    }
                  }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent group"
                >
                  {!isPreviewPlaying && (
                    <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 ml-1 text-white fill-white" />
                    </div>
                  )}
                </button>

                {/* Preview Overlay Badge */}
                <div className="absolute top-16 left-4 z-20 flex items-center gap-2">
                  <div className="bg-emerald-500 text-slate-950 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Clip {(trimEnd - trimStart).toFixed(1)}s
                  </div>
                  <div className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/15">
                    {recordedFilterRef.current.name}
                  </div>
                </div>

                {/* Quick Audio Mute on Preview */}
                <button
                  onClick={() => setPreviewMuted(!previewMuted)}
                  className="absolute top-16 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  title={previewMuted ? 'Unmute' : 'Mute'}
                >
                  {previewMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                </button>
              </>
            )}
          </div>
        )}

        {/* SIDE TOOLBAR (Live Controls: Flip, Mic, Filters, Countdown) */}
        {(cameraStatus === 'ready' || cameraStatus === 'recording') && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl">
            {/* Flip Camera - only before recording */}
            {cameraStatus === 'ready' && (
              <button
                onClick={handleFlipCamera}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                title="Flip Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Mic Toggle - accessible before or during recording */}
            <button
              onClick={handleToggleMic}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                isMicEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
              title={isMicEnabled ? 'Mute Microphone' : 'Enable Microphone'}
            >
              {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Visual Filters Drawer Toggle - before or during recording */}
            <button
              onClick={() => setShowFilterPicker(!showFilterPicker)}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
                activeFilter !== 'normal'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 ring-2 ring-amber-300'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Real-Time Video Filters (Toggle before or during recording)"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Countdown Timer - only before recording */}
            {cameraStatus === 'ready' && (
              <button
                onClick={() => {
                  const next = countdownSetting === 0 ? 3 : countdownSetting === 3 ? 5 : 0;
                  setCountdownSetting(next);
                  showToast(next === 0 ? 'Countdown timer off' : `Countdown timer: ${next}s`);
                }}
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center active:scale-95 transition-all ${
                  countdownSetting > 0 ? 'bg-indigo-600 text-white font-bold' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Timer Delay"
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold mt-0.5">{countdownSetting === 0 ? 'Off' : `${countdownSetting}s`}</span>
              </button>
            )}

            {/* Alternate file upload shortcut - only before recording */}
            {cameraStatus === 'ready' && (
              <label
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                title="Import Video File"
              >
                <Layers className="w-4 h-4" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center">
          {/* REAL-TIME FILTER SELECTION CAROUSEL (TOGGLE BEFORE OR DURING RECORDING) */}
          {(cameraStatus === 'ready' || cameraStatus === 'recording') && (
            <div className="w-full mb-3 flex flex-col items-center gap-1.5 animate-in fade-in duration-150">
              {/* Filter HUD & Prev/Next Quick Navigation */}
              <div className="flex items-center justify-between w-full max-w-sm px-1 text-white">
                <button
                  type="button"
                  onClick={() => handleCycleFilter('prev')}
                  className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10"
                  title="Previous real-time filter"
                  aria-label="Previous filter"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white tracking-tight">
                    {currentFilterObj.name}
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {currentFilterObj.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCycleFilter('next')}
                  className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10"
                  title="Next real-time filter"
                  aria-label="Next filter"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Horizontal Scrollable Filter Swatches */}
              <div className="w-full max-w-md flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
                {FILTERS.map((f) => {
                  const isSelected = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFilterSelect(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all backdrop-blur-md shrink-0 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-md shadow-amber-400/25 ring-2 ring-white/80'
                          : 'bg-black/50 hover:bg-black/75 text-white/90 border border-white/15'
                      }`}
                      title={`${f.name} - ${f.description}`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${f.previewBg} border border-white/50 shrink-0 shadow-sm`}
                      />
                      <span>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BGM PICKER SHEET (When toggled open) */}
          {showBgmPicker && cameraStatus === 'ready' && (
            <div className="w-full mb-4 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Select Backing Soundtrack</span>
                {selectedBgmId && (
                  <button onClick={() => handleSelectBgm(null)} className="text-rose-400 text-[10px]">
                    Remove Audio
                  </button>
                )}
              </div>
              {SAMPLE_AUDIO_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleSelectBgm(track.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                    selectedBgmId === track.id
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">{track.title}</div>
                      <div className="text-[10px] text-slate-400">{track.artist}</div>
                    </div>
                  </div>
                  {selectedBgmId === track.id && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          )}

          {/* MAIN RECORD SHUTTER (Ready or Recording state) */}
          {cameraStatus !== 'preview' && cameraStatus !== 'error' && (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              {/* Mode Toggle: Video Reel vs Photo Snapshot */}
              {cameraStatus === 'ready' && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setShutterMode('video')}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      shutterMode === 'video'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    📹 Video Reel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShutterMode('photo')}
                    className={`px-3.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      shutterMode === 'photo'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    📸 Snap Photo
                  </button>
                </div>
              )}

              <div className="flex items-center justify-around w-full">
                {/* Left quick slot: demo switch */}
                <button
                  onClick={isSimulatedCamera ? () => startCamera(facingMode, isMicEnabled) : startSimulatedCamera}
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 text-xs transition-colors cursor-pointer"
                  title={isSimulatedCamera ? 'Switch to Real Web Camera' : 'Switch to Demo Camera'}
                >
                  {isSimulatedCamera ? <Camera className="w-5 h-5 text-amber-400" /> : <Sparkles className="w-5 h-5 text-indigo-300" />}
                </button>

                {/* PRIMARY SHUTTER BUTTON */}
                <div className="relative flex items-center justify-center">
                  {/* SVG Progress Ring when recording video */}
                  {cameraStatus === 'recording' && (
                    <svg className="absolute w-24 h-24 -rotate-90 pointer-events-none">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        className="stroke-rose-600/30"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        className="stroke-rose-500"
                        strokeWidth="5"
                        strokeDasharray={276}
                        strokeDashoffset={276 - 276 * progressRatio}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  )}

                  {cameraStatus === 'recording' ? (
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform cursor-pointer"
                      aria-label="Stop Recording Video"
                    >
                      <div className="w-7 h-7 rounded-sm bg-white" />
                    </button>
                  ) : shutterMode === 'photo' ? (
                    <button
                      onClick={handleSnapPhoto}
                      className="w-20 h-20 rounded-full border-4 border-amber-300 p-1 flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer bg-white/20"
                      aria-label="Take Photo Snapshot"
                      title="Take Photo Snapshot with Active Filter"
                    >
                      <div className="w-full h-full rounded-full bg-amber-400 hover:bg-amber-300 flex items-center justify-center transition-colors">
                        <Camera className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer"
                      aria-label="Start Recording Video"
                    >
                      <div className="w-full h-full rounded-full bg-rose-500 hover:bg-rose-600 transition-colors" />
                    </button>
                  )}
                </div>

                {/* Right quick slot: gallery/file import (Photos or Videos) */}
                <label
                  className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 text-xs transition-colors cursor-pointer"
                  title="Upload Video or Photo from files"
                >
                  <Layers className="w-5 h-5" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* VIDEO TRIMMING INTERFACE (IN PREVIEW SCREEN) */}
          {cameraStatus === 'preview' && isTrimmerOpen && (
            <div className="w-full mb-3 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Header with Timestamps & Reset */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trim Video Range</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {(trimEnd - trimStart).toFixed(1)}s active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(trimStart > 0 || trimEnd < clipDuration) && (
                    <button
                      type="button"
                      onClick={handleResetTrim}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                      title="Reset to full clip length"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total: {clipDuration.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Visual Filmstrip Scrubber Track with Interactive Trimming Handles */}
              <div className="relative w-full h-12 bg-slate-950 rounded-xl border border-slate-700/80 overflow-hidden flex items-center select-none shadow-inner">
                {/* Filmstrip tick notches */}
                <div className="absolute inset-0 opacity-20 flex justify-between px-2 pointer-events-none items-center">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-1 h-5 bg-white rounded-full" />
                  ))}
                </div>

                {/* Left Dimmed Mask (Before Start) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/75 pointer-events-none z-10 transition-all"
                  style={{ width: `${Math.max(0, (trimStart / clipDuration) * 100)}%` }}
                />

                {/* Active Highlighted Trim Window */}
                <div
                  className="absolute top-0 bottom-0 bg-amber-400/20 border-y-2 border-amber-400 pointer-events-none z-10 transition-all flex items-center justify-between"
                  style={{
                    left: `${Math.max(0, (trimStart / clipDuration) * 100)}%`,
                    width: `${Math.min(100, Math.max(2, ((trimEnd - trimStart) / clipDuration) * 100))}%`,
                  }}
                >
                  {/* Left Trim Handle */}
                  <div className="w-3 h-full bg-amber-400 flex items-center justify-center rounded-l shadow-md">
                    <div className="w-0.5 h-4 bg-slate-950 rounded-full" />
                  </div>

                  {/* Right Trim Handle */}
                  <div className="w-3 h-full bg-amber-400 flex items-center justify-center rounded-r shadow-md">
                    <div className="w-0.5 h-4 bg-slate-950 rounded-full" />
                  </div>
                </div>

                {/* Right Dimmed Mask (After End) */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/75 pointer-events-none z-10 transition-all"
                  style={{ width: `${Math.max(0, 100 - (trimEnd / clipDuration) * 100)}%` }}
                />

                {/* Playhead Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-20 pointer-events-none transition-all"
                  style={{
                    left: `${Math.min(
                      (trimEnd / clipDuration) * 100,
                      Math.max((trimStart / clipDuration) * 100, (currentPlayTime / clipDuration) * 100)
                    )}%`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white -ml-0.5 -mt-0.5 shadow-md" />
                </div>

                {/* Interactive Dual HTML5 Sliders */}
                <input
                  type="range"
                  min={0}
                  max={clipDuration}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => handleTrimStartChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 z-30 cursor-ew-resize pointer-events-auto"
                  title="Drag to adjust Start Time"
                  aria-label="Trim Start Time"
                />
                <input
                  type="range"
                  min={0}
                  max={clipDuration}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => handleTrimEndChange(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 z-30 cursor-ew-resize pointer-events-auto"
                  title="Drag to adjust End Time"
                  aria-label="Trim End Time"
                />
              </div>

              {/* Time Indicators & Quick Trim Presets */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500">In:</span>
                  <span className="font-mono text-white font-semibold">{formatTimestamp(trimStart)}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-500">Out:</span>
                  <span className="font-mono text-white font-semibold">{formatTimestamp(trimEnd)}</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1">
                  {clipDuration > 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrimStart(0);
                        setTrimEnd(Math.min(5, clipDuration));
                        if (previewVideoRef.current) previewVideoRef.current.currentTime = 0;
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                      5s
                    </button>
                  )}
                  {clipDuration > 10 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrimStart(0);
                        setTrimEnd(Math.min(10, clipDuration));
                        if (previewVideoRef.current) previewVideoRef.current.currentTime = 0;
                      }}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                      10s
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleResetTrim}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-medium transition-colors"
                  >
                    Full
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW CONTROLS (Retake vs Share) */}
          {cameraStatus === 'preview' && (
            <div className="w-full flex items-center justify-between gap-2.5">
              {/* Retake Button */}
              <button
                type="button"
                onClick={handleRetake}
                className="py-3 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors"
                title="Retake video clip"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Retake</span>
              </button>

              {/* Trim Toggle Button - only for video */}
              {capturedMediaType === 'video' && (
                <button
                  type="button"
                  onClick={() => setIsTrimmerOpen(!isTrimmerOpen)}
                  className={`py-3 px-3.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer ${
                    isTrimmerOpen
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                  title="Toggle Trimming Tool"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Trim</span>
                </button>
              )}

              {/* Download Clip / Photo */}
              <button
                type="button"
                onClick={handleDownloadClip}
                className="w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-md transition-colors shrink-0 cursor-pointer"
                title={capturedMediaType === 'image' ? 'Download Photo' : 'Download video clip'}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Share / Next Button */}
              <button
                type="button"
                onClick={() => setIsPublishOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {capturedMediaType === 'image'
                    ? 'Share Photo 📸'
                    : `Share (${(trimEnd - trimStart).toFixed(1)}s)`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PUBLISH MODAL */}
      {isPublishOpen && recordedBlob && (
        <PublishModal
          videoBlob={recordedBlob}
          videoUrl={recordedVideoUrl || ''}
          mediaType={capturedMediaType}
          filterApplied={recordedFilterRef.current.name}
          trimmedDuration={Math.max(0.5, trimEnd - trimStart)}
          audioTitle={
            selectedBgmId
              ? SAMPLE_AUDIO_TRACKS.find((t) => t.id === selectedBgmId)?.title || 'Original Sound'
              : 'Original Sound'
          }
          audioArtist={
            selectedBgmId
              ? SAMPLE_AUDIO_TRACKS.find((t) => t.id === selectedBgmId)?.artist || 'Aapni Gapsap'
              : 'Aapni Gapsap'
          }
          onClose={() => setIsPublishOpen(false)}
          onSuccess={() => {
            setIsPublishOpen(false);
            closeCamera();
          }}
        />
      )}
    </div>
  );
};
