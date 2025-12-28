/**
 * My Certificates Page
 * List all donation certificates earned by the user
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiShare2, FiDownload, FiExternalLink, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const MyCertificatesPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates/my');
      setCertificates(response.data.data);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = (certificateId) => {
    // Use current origin for same-domain deployment
    return `${window.location.origin}/share/certificate/${certificateId}`;
  };

  const shareToWhatsApp = (cert) => {
    const shareUrl = getShareUrl(cert.certificateId);
    const text = `🎉 I just donated "${cert.foodTitle}" through Feed In Need!\n\n🍲 Food: ${cert.foodTitle}\n📦 Quantity: ${cert.quantity}\n\nJoin me in fighting hunger and food waste! 💚\n\n${shareUrl}\n\n#FeedInNeed #FoodDonation #ZeroHunger`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = (cert) => {
    const shareUrl = getShareUrl(cert.certificateId);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiAward className="text-amber-500" />
            My Donation Certificates
          </h1>
          <p className="text-gray-600 mt-2">
            Certificates earned for your generous food donations
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <FiAward className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Certificates Yet</h2>
            <p className="text-gray-500 mb-6">
              Complete your first donation to earn a certificate!
            </p>
            <Link to="/donate" className="btn-primary">
              Make a Donation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert) => (
              <div 
                key={cert._id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Certificate Preview */}
                  <div className="md:w-1/3 p-4 bg-gradient-to-br from-green-500 to-teal-600">
                    <div className="aspect-video md:aspect-square rounded-xl bg-white/10 flex flex-col items-center justify-center text-white p-4">
                      <FiAward className="text-4xl mb-2" />
                      <span className="font-bold text-lg text-center">Donation Certificate</span>
                      <span className="text-sm opacity-75 mt-1">#{cert.certificateId}</span>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cert.foodTitle}</h3>
                        <p className="text-gray-600">{cert.quantity}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                      <FiCalendar />
                      <span>
                        {new Date(cert.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      Received by: <span className="font-medium">{cert.receiver?.name || cert.receiverName}</span>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        to={`/certificate/${cert.certificateId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <FiExternalLink />
                        View
                      </Link>
                      
                      <button
                        onClick={() => shareToFacebook(cert)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Share
                      </button>
                      
                      <button
                        onClick={() => shareToWhatsApp(cert)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificatesPage;
