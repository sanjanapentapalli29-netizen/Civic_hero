import React, { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, RotateCcw, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (base64Data: string) => void;
  savedImage?: string;
}

export default function CameraCapture({ onCapture, savedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined realistic mock photos for testing when camera is unavailable or inside iframe
  const mockPhotos = [
    {
      id: "mock-garbage",
      name: "Overflowing Garbage Pile",
      url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: "mock-pothole",
      name: "Deep Road Pothole",
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: "mock-light",
      name: "Unlit Damaged Streetlight",
      url: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: "mock-clog",
      name: "Water Clogged Junction",
      url: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&q=80&w=600",
    }
  ];

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed", err);
      setError("Unable to access real camera (permissions blocked or no camera connected). Please select one of our premium quick-capture templates below to test!");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current frame from video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const dataUrl = canvas.toDataURL("image/jpeg");
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const selectMockPhoto = (url: string) => {
    onCapture(url);
    stopCamera();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all" id="camera-capture-container">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600 animate-pulse" />
          Camera Evidence Attachment
        </label>
        {cameraActive && (
          <button
            type="button"
            onClick={stopCamera}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            id="stop-camera-btn"
          >
            <RotateCcw className="w-3 h-3" /> Stop Feed
          </button>
        )}
      </div>

      {savedImage ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black">
          <img
            src={savedImage}
            alt="Evidence Capture"
            className="w-full h-48 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full text-xs shadow-md flex items-center gap-1 px-2 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Attached
          </div>
          <button
            type="button"
            onClick={() => onCapture("")}
            className="absolute bottom-2 left-2 bg-black/70 hover:bg-black/90 text-white text-xs py-1.5 px-3 rounded-md transition flex items-center gap-1"
            id="retake-photo-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Remove & Retake
          </button>
        </div>
      ) : cameraActive ? (
        <div className="relative rounded-lg overflow-hidden bg-black border border-slate-700">
          <video
            ref={videoRef}
            className="w-full h-48 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs py-2 px-5 rounded-full shadow-lg transition flex items-center gap-1.5"
              id="capture-shutter-btn"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              Snap Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={startCamera}
            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition flex flex-col items-center justify-center gap-2 group text-center"
            id="start-camera-feed-btn"
          >
            <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Open Camera Stream
            </span>
            <span className="text-xs text-slate-500">
              Allows real-time snapping of trash or hazards on your block
            </span>
          </button>

          {error && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200/40 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold mb-1">Sandbox Environment Limit</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Quick-Capture Templates */}
          <div className="mt-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              Or choose a template photo representing common issues:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mockPhotos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectMockPhoto(p.url)}
                  className="group relative h-16 rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  id={`mock-photo-select-${p.id}`}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-end p-1">
                    <span className="text-[10px] leading-tight font-medium text-white truncate w-full text-left">
                      {p.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
