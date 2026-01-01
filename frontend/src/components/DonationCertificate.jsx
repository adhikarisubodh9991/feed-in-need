/**
 * Donation Certificate Component
 * Creates a beautiful shareable certificate/banner for social media
 * This component is shown after a donation is completed
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiHeart, FiAward, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DonationCertificate = ({ donation, user, certificate, onClose }) => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Get share URL that serves OG meta tags (uses current origin for same-domain deployment)
  const getShareUrl = () => {
    if (certificate?.certificateId) {
      return `${window.location.origin}/share/certificate/${certificate.certificateId}`;
    }
    return window.location.origin;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate certificate image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = 600;
    const height = 700;
    
    canvas.width = width;
    canvas.height = height;
    
    // Load logo image
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/logo.png';
    
    const drawCertificate = (logoImg) => {
      // Background gradient with pattern
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#059669');
      gradient.addColorStop(0.3, '#10b981');
      gradient.addColorStop(0.7, '#14b8a6');
      gradient.addColorStop(1, '#0d9488');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Decorative pattern - dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < width; i += 30) {
        for (let j = 0; j < height; j += 30) {
          ctx.beginPath();
          ctx.arc(i, j, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Decorative corner elements
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      
      // Top left corner
      ctx.beginPath();
      ctx.moveTo(20, 60);
      ctx.lineTo(20, 20);
      ctx.lineTo(60, 20);
      ctx.stroke();
      
      // Top right corner
      ctx.beginPath();
      ctx.moveTo(width - 60, 20);
      ctx.lineTo(width - 20, 20);
      ctx.lineTo(width - 20, 60);
      ctx.stroke();
      
      // Bottom left corner
      ctx.beginPath();
      ctx.moveTo(20, height - 60);
      ctx.lineTo(20, height - 20);
      ctx.lineTo(60, height - 20);
      ctx.stroke();
      
      // Bottom right corner
      ctx.beginPath();
      ctx.moveTo(width - 60, height - 20);
      ctx.lineTo(width - 20, height - 20);
      ctx.lineTo(width - 20, height - 60);
      ctx.stroke();
      
      // Logo circle background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(width / 2, 75, 50, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw logo if loaded
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 75, 45, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, width / 2 - 45, 30, 90, 90);
        ctx.restore();
      } else {
        // Fallback emoji if logo doesn't load
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🍲', width / 2, 90);
      }
      
      // Certificate ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 60, 140);
      ctx.lineTo(width / 2 + 60, 140);
      ctx.lineTo(width / 2 + 50, 155);
      ctx.lineTo(width / 2 + 60, 170);
      ctx.lineTo(width / 2 - 60, 170);
      ctx.lineTo(width / 2 - 50, 155);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED DONOR', width / 2, 160);
      
      // Header text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('CERTIFICATE OF', width / 2, 210);
      ctx.font = 'bold 36px Arial';
      ctx.fillText('FOOD DONATION', width / 2, 250);
      
      // Decorative line under header
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100, 265);
      ctx.lineTo(width / 2 + 100, 265);
      ctx.stroke();
      
      // Star decorations
      ctx.fillStyle = '#fde047';
      ctx.font = '16px Arial';
      ctx.fillText('★', width / 2 - 110, 265);
      ctx.fillText('★', width / 2 + 110, 265);
      
      // "This certifies that" text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'italic 18px Georgia';
      ctx.fillText('This is to certify that', width / 2, 310);
      
      // Donor name box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      const donorName = user?.name || 'A Kind Soul';
      ctx.roundRect(80, 330, width - 160, 55, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Georgia';
      ctx.fillText(donorName, width / 2, 367);
      
      // "has generously donated" text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'italic 18px Georgia';
      ctx.fillText('has generously donated', width / 2, 420);
      
      // Food title box with icon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.roundRect(50, 445, width - 100, 90, 15);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 26px Arial';
      const foodTitle = donation.foodTitle.length > 28 
        ? donation.foodTitle.substring(0, 28) + '...' 
        : donation.foodTitle;
      ctx.fillText('🍽️ ' + foodTitle, width / 2, 485);
      ctx.font = '18px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('📦 ' + donation.quantity, width / 2, 520);
      
      // Heart message
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '16px Arial';
      ctx.fillText('❤️ Helping reduce food waste & hunger in Nepal', width / 2, 570);
      
      // Divider with decorations
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, 595);
      ctx.lineTo(width - 80, 595);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      ctx.fillText('✦', width / 2, 598);
      
      // Footer with branding
      ctx.fillStyle = 'white';
      ctx.font = 'bold 22px Arial';
      ctx.fillText('Feed In Need', width / 2, 635);
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText('Connecting Food Donors with Those in Need', width / 2, 655);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px Arial';
      ctx.fillText(formatDate(donation.createdAt) + ' • feedinneed.org', width / 2, 680);
      
      // Save image data URL
      setImageDataUrl(canvas.toDataURL('image/png'));
    };
    
    logo.onload = () => {
      setLogoLoaded(true);
      drawCertificate(logo);
    };
    
    logo.onerror = () => {
      // Draw without logo if it fails to load
      drawCertificate(null);
    };
    
    // Start loading or draw immediately if logo cached
    if (logo.complete) {
      drawCertificate(logo);
    }
  }, [donation, user]);

  const downloadCertificate = () => {
    if (!imageDataUrl) {
      toast.error('Certificate not ready yet');
      return;
    }
    
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `FeedInNeed-Certificate-${donation.foodTitle.replace(/\s+/g, '-')}.png`;
      link.href = imageDataUrl;
      link.click();
      toast.success('Certificate downloaded!');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const shareToWhatsApp = () => {
    const shareUrl = getShareUrl();
    const text = `🎉 I just donated "${donation.foodTitle}" through Feed In Need!\n\n` +
      `🍲 Food: ${donation.foodTitle}\n` +
      `📦 Quantity: ${donation.quantity}\n` +
      `📍 Location: ${donation.address?.split(',')[0] || 'Nepal'}\n\n` +
      `Join me in fighting hunger and food waste! 💚\n` +
      `${shareUrl}\n\n` +
      `#FeedInNeed #FoodDonation #ZeroHunger`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    const shareUrl = getShareUrl();
    // Facebook will automatically fetch OG meta tags from the share URL
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToX = () => {
    const shareUrl = getShareUrl();
    const text = `🎉 I just donated "${donation.foodTitle}" through @FeedInNeed!\n\nJoin me in fighting hunger and food waste! 💚\n\n${shareUrl}\n\n#FoodDonation #ZeroHunger`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
  };

  const viewCertificatePage = () => {
    if (certificate?.certificateId) {
      navigate(`/certificate/${certificate.certificateId}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden animate-fadeIn relative">
          {/* Close Button - Top Right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Hidden Canvas for Certificate Generation */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Certificate Preview */}
          <div className="p-4 bg-gray-50">
            {imageDataUrl ? (
              <img 
                src={imageDataUrl} 
                alt="Donation Certificate" 
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="aspect-square bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white">Generating certificate...</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-5 border-t">
            <h3 className="font-bold text-gray-900 text-center mb-4">
              Share Your Good Deed! 🎉
            </h3>

            {/* Download Button */}
            <button
              onClick={downloadCertificate}
              disabled={downloading || !imageDataUrl}
              className="w-full btn-primary py-3 mb-4 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>Downloading...</>
              ) : (
                <>
                  <FiDownload />
                  Download Certificate
                </>
              )}
            </button>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-1 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs font-medium">WhatsApp</span>
              </button>
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-1 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs font-medium">Facebook</span>
              </button>
              <button
                onClick={shareToX}
                className="flex flex-col items-center gap-1 p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs font-medium">X</span>
              </button>
            </div>

            {/* View Certificate Page Button */}
            {certificate?.certificateId && (
              <button
                onClick={viewCertificatePage}
                className="w-full py-2.5 mb-3 text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <FiShare2 />
                View Full Certificate Page
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCertificate;
