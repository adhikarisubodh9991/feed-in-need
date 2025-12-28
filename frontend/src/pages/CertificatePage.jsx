/**
 * Certificate Page
 * View and share donation certificate with social media sharing
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiDownload, FiShare2, FiAward, FiArrowLeft, FiCheck, FiCopy } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import VerifiedBadge from '../components/VerifiedBadge';
import TrustedBadge from '../components/TrustedBadge';

const CertificatePage = () => {
  const { certificateId } = useParams();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [certificate, setCertificate] = useState(null);
  const [shareUrls, setShareUrls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      const [certResponse, shareResponse] = await Promise.all([
        api.get(`/certificates/id/${certificateId}`),
        api.get(`/certificates/${certificateId}/share-urls`),
      ]);
      
      setCertificate(certResponse.data.data);
      setShareUrls(shareResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  // Generate certificate image on canvas
  useEffect(() => {
    if (!certificate) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 630;
    
    canvas.width = width;
    canvas.height = height;
    
    const drawCertificate = () => {
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#059669');
      gradient.addColorStop(0.3, '#10b981');
      gradient.addColorStop(0.7, '#14b8a6');
      gradient.addColorStop(1, '#0d9488');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Decorative pattern - dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < width; i += 40) {
        for (let j = 0; j < height; j += 40) {
          ctx.beginPath();
          ctx.arc(i, j, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Decorative corner elements
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;
      
      // Corners
      const cornerSize = 80;
      [[30, 30], [width - 30, 30], [30, height - 30], [width - 30, height - 30]].forEach(([x, y], i) => {
        ctx.beginPath();
        if (i === 0) {
          ctx.moveTo(x, y + cornerSize);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerSize, y);
        } else if (i === 1) {
          ctx.moveTo(x - cornerSize, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + cornerSize);
        } else if (i === 2) {
          ctx.moveTo(x, y - cornerSize);
          ctx.lineTo(x, y);
          ctx.lineTo(x + cornerSize, y);
        } else {
          ctx.moveTo(x - cornerSize, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y - cornerSize);
        }
        ctx.stroke();
      });
      
      // Logo circle background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(width / 2, 80, 55, 0, Math.PI * 2);
      ctx.fill();
      
      // Emoji as logo fallback
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🍲', width / 2, 100);
      
      // Certificate ribbon
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, 155);
      ctx.lineTo(width / 2 + 80, 155);
      ctx.lineTo(width / 2 + 65, 175);
      ctx.lineTo(width / 2 + 80, 195);
      ctx.lineTo(width / 2 - 80, 195);
      ctx.lineTo(width / 2 - 65, 175);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED DONATION', width / 2, 182);
      
      // Header text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('CERTIFICATE OF', width / 2, 250);
      ctx.font = 'bold 48px Arial';
      ctx.fillText('FOOD DONATION', width / 2, 305);
      
      // Decorative line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 150, 325);
      ctx.lineTo(width / 2 + 150, 325);
      ctx.stroke();
      
      // Stars
      ctx.fillStyle = '#fde047';
      ctx.font = '20px Arial';
      ctx.fillText('★', width / 2 - 165, 328);
      ctx.fillText('★', width / 2 + 165, 328);
      
      // "This certifies that" text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'italic 22px Georgia';
      ctx.fillText('This is to certify that', width / 2, 370);
      
      // Donor name box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(200, 390, width - 400, 60, 15);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 34px Georgia';
      ctx.fillText(certificate.donorName, width / 2, 430);
      
      // "has generously donated" text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'italic 22px Georgia';
      ctx.fillText('has generously donated', width / 2, 485);
      
      // Food title box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(150, 505, width - 300, 70, 15);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      const foodTitle = certificate.foodTitle.length > 40 
        ? certificate.foodTitle.substring(0, 40) + '...' 
        : certificate.foodTitle;
      ctx.fillText('🍽️ ' + foodTitle, width / 2, 540);
      ctx.font = '22px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('📦 ' + certificate.quantity, width / 2, 565);
      
      // Footer
      ctx.fillStyle = 'white';
      ctx.font = 'bold 26px Arial';
      ctx.fillText('Feed In Need', width / 2, 610);
      
      // Certificate ID
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '14px Arial';
      ctx.fillText(`Certificate ID: ${certificate.certificateId}`, width - 150, height - 20);
      
      // Date
      const date = new Date(certificate.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.fillText(date, 150, height - 20);
      
      // Save image data URL
      setImageDataUrl(canvas.toDataURL('image/png'));
    };
    
    drawCertificate();
  }, [certificate]);

  const downloadCertificate = () => {
    if (!imageDataUrl) {
      toast.error('Certificate image not ready');
      return;
    }
    
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.download = `FeedInNeed-Certificate-${certificate.certificateId}.png`;
      link.href = imageDataUrl;
      link.click();
      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrls?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrls.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToFacebook = () => {
    if (!shareUrls?.facebookUrl) return;
    window.open(shareUrls.facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    if (!shareUrls?.whatsappUrl) return;
    window.open(shareUrls.whatsappUrl, '_blank');
  };

  const shareToTwitter = () => {
    if (!shareUrls?.twitterUrl) return;
    window.open(shareUrls.twitterUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiAward className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Certificate Not Found</h2>
          <p className="text-gray-500 mb-6">This certificate doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FiArrowLeft />
          Back to Home
        </Link>

        {/* Certificate Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hidden Canvas for Certificate Generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Certificate Preview */}
          <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200">
            {imageDataUrl ? (
              <img 
                src={imageDataUrl} 
                alt="Donation Certificate" 
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="aspect-video bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">Generating certificate...</span>
              </div>
            )}
          </div>

          {/* Certificate Info */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiAward className="text-amber-500" />
                  Donation Certificate
                </h1>
                <p className="text-gray-500 mt-1">
                  Certificate ID: <span className="font-mono text-gray-700">{certificate.certificateId}</span>
                </p>
              </div>
              {certificate.donor?.isTrusted && (
                <TrustedBadge />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Donor</h3>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {certificate.donorName}
                  {certificate.donor?.isTrusted && <TrustedBadge size="small" />}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Received By</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.receiverName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Food Donated</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.foodTitle}</p>
                <p className="text-gray-600">{certificate.quantity}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date Completed</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(certificate.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Share Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiShare2 />
                Share Your Good Deed
              </h3>

              {/* Share URL with Copy */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-100 rounded-lg">
                <input 
                  type="text" 
                  value={shareUrls?.shareUrl || ''} 
                  readOnly 
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                <button
                  onClick={copyShareLink}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Facebook */}
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>

                {/* Twitter/X */}
                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center gap-2 p-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </button>

                {/* Download */}
                <button
                  onClick={downloadCertificate}
                  disabled={downloading || !imageDataUrl}
                  className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <FiDownload />
                  {downloading ? 'Saving...' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-2">💡 Sharing Tip</h4>
          <p className="text-green-700 text-sm">
            When you share on Facebook or WhatsApp, the link will automatically show a preview 
            with your donation details. This helps spread awareness about food donation!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
