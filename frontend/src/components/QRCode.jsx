/**
 * QR Code Components for Pickup Verification
 * Includes QR Code display (for donors) and QR Scanner (for receivers)
 */

import { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

/**
 * QR Code Display Component
 * Generates and displays QR code for donors to show receivers
 */
export const QRCodeDisplay = ({ data, size = 200 }) => {
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      // Use QR Server API to generate QR code
      const encodedData = encodeURIComponent(data);
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&format=png&margin=10`;
      setQrUrl(url);
      setLoading(false);
    }
  }, [data, size]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ width: size, height: size }}
      >
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 rounded-lg text-red-500"
        style={{ width: size, height: size }}
      >
        <FiAlertCircle size={32} />
      </div>
    );
  }

  return (
    <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
      <img 
        src={qrUrl} 
        alt="Pickup QR Code" 
        width={size} 
        height={size}
        className="rounded"
        onError={() => setError('Failed to generate QR code')}
      />
      <p className="text-center text-xs text-gray-500 mt-2">
        Show this QR code to the receiver
      </p>
    </div>
  );
};

/**
 * QR Scanner Component
 * Allows receivers to scan QR code from donor's device
 */
export const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setScanning(true);
        
        // Start scanning after video is ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please use a device with a camera.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setScanning(false);
  };

  const startScanning = () => {
    // Use jsQR library via CDN (will be loaded dynamically)
    if (!window.jsQR) {
      // Load jsQR dynamically
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      script.onload = () => scanFrame();
      document.head.appendChild(script);
    } else {
      scanFrame();
    }
  };

  const scanFrame = () => {
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !window.jsQR) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR code detected
        stopCamera();
        onScan(code.data);
      }
    }, 100); // Scan every 100ms
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h3 className="text-lg font-semibold">Scan QR Code</h3>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {error ? (
          <div className="text-center text-white p-4">
            <FiAlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <p className="mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-md aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              muted
            />
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />
                
                {/* Scanning line animation */}
                {scanning && (
                  <div className="absolute inset-x-4 h-0.5 bg-primary-400 animate-scan" />
                )}
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 text-center text-white text-sm">
        <FiCamera className="inline mr-2" />
        Point your camera at the QR code on donor's device
      </div>

      {/* Scanning animation style */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

/**
 * Combined Pickup Verification Modal
 * Allows receivers to either enter code manually or scan QR
 */
export const PickupVerificationModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  isVerifying = false 
}) => {
  const [mode, setMode] = useState('code'); // 'code' or 'scan'
  const [code, setCode] = useState('');
  const [scanError, setScanError] = useState('');

  if (!isOpen) return null;

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      onVerify({ type: 'code', value: code.toUpperCase() });
    }
  };

  const handleQRScan = (qrData) => {
    try {
      // Try to parse as JSON (our QR format)
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'FEED_IN_NEED_PICKUP') {
        onVerify({ type: 'qr', value: qrData });
      } else {
        setScanError('Invalid QR code. Please scan the correct pickup QR code.');
        setMode('code');
      }
    } catch {
      setScanError('Invalid QR code format. Please try entering the code manually.');
      setMode('code');
    }
  };

  return (
    <>
      {mode === 'scan' ? (
        <QRScanner 
          onScan={handleQRScan}
          onClose={() => setMode('code')}
        />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Food Pickup</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>

            {scanError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {scanError}
              </div>
            )}

            {/* Code Entry Form */}
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Confirmation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono uppercase"
                  maxLength={6}
                  disabled={isVerifying}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this code from the donor
                </p>
              </div>

              <button
                type="submit"
                disabled={!code.trim() || isVerifying}
                className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Confirm Pickup
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* QR Scan Option */}
            <button
              onClick={() => setMode('scan')}
              disabled={isVerifying}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiCamera />
              Scan QR Code
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Ask the donor to show you their QR code or tell you the confirmation code
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeDisplay;
