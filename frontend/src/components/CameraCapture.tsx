import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
      setStream(newStream);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Unable to access camera. Please check permissions.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

  const capturePhoto = () => {
    console.log('📸 Capture button clicked');

    if (!videoRef.current || !canvasRef.current || !isReady) {
      console.log('❌ Camera not ready:', {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current,
        isReady
      });
      toast.error('Camera not ready. Please wait.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.log('❌ Cannot get canvas context');
      toast.error('Unable to capture photo. Please try again.');
      return;
    }

    console.log('📸 Capturing photo with dimensions:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight
    });

    // Optimize image size: scale down to max 1280px width for faster processing
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const scaledWidth = video.videoWidth * scale;
    const scaledHeight = video.videoHeight * scale;

    // Set canvas to scaled dimensions
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // Draw video frame to canvas with scaling
    context.drawImage(video, 0, 0, scaledWidth, scaledHeight);

    // Convert to data URL with reduced quality to minimize payload
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.65);
    console.log('📸 Photo captured successfully:', {
      originalDimensions: { width: video.videoWidth, height: video.videoHeight },
      scaledDimensions: { width: scaledWidth, height: scaledHeight },
      dataUrlLength: imageDataUrl.length,
      preview: imageDataUrl.substring(0, 100) + '...'
    });

    // Stop camera and return image
    stopCamera();
    onCapture(imageDataUrl);
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setIsReady(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white bg-black/50">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <h2 className="text-lg font-bold">Take Photo</h2>
        
        <Button
          onClick={switchCamera}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
          disabled={!isReady}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Camera overlay guides */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner guides for framing */}
          <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-white/50" />
          <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-white/50" />
          <div className="absolute bottom-24 left-8 w-8 h-8 border-l-2 border-b-2 border-white/50" />
          <div className="absolute bottom-24 right-8 w-8 h-8 border-r-2 border-b-2 border-white/50" />
          
          {/* Center text guidance */}
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-center">
            <p className="text-white/80 text-sm bg-black/30 inline-block px-3 py-1 rounded">
              📸 Frame your recipe or dish
            </p>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="p-6 bg-black/50">
        <div className="flex items-center justify-center">
          <Button
            onClick={capturePhoto}
            disabled={!isReady}
            className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black border-4 border-white/30 flex items-center justify-center"
          >
            <Camera className="w-6 h-6" />
          </Button>
        </div>
        
        <p className="text-white/80 text-center text-sm mt-3">
          {isReady ? 'Tap to capture' : 'Loading camera...'}
        </p>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;