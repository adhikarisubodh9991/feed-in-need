/**
 * Home Page
 * Landing page with information about the platform
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiUsers, FiCheck, FiArrowRight, FiGift, FiShield, FiTrendingUp } from 'react-icons/fi';

const HomePage = () => {
  const { isAuthenticated, isDonor, isReceiver } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Share Food,</span><br />
              <span className="text-emerald-400">Spread Hope</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Connect surplus food with those who need it most. Join our community of generous donors and make a real difference.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <>
                  {isDonor && (
                    <Link
                      to="/donate"
                      className="group inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FiHeart className="w-5 h-5" />
                      Donate Food
                      <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  {isReceiver && (
                    <Link
                      to="/donations"
                      className="group inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <FiGift className="w-5 h-5" />
                      Browse Donations
                      <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/donations"
                    className="inline-flex items-center gap-2 border-2 border-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    View Donations
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Simple steps to donate or receive food through our platform</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Donors */}
            <div className="group bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <FiHeart className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Donors</h3>
              <ol className="text-gray-600 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                  <span>Register as a donor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                  <span>Fill donation details with photo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                  <span>Select pickup location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
                  <span>Share and help others!</span>
                </li>
              </ol>
            </div>

            {/* For Receivers */}
            <div className="group bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <FiUsers className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Receivers</h3>
              <ol className="text-gray-600 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                  <span>Register with ID verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                  <span>Wait for admin approval</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                  <span>Browse available donations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
                  <span>Request and collect food!</span>
                </li>
              </ol>
            </div>

            {/* Verification */}
            <div className="group bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <FiShield className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Safe & Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                All receivers are verified by our admin team to ensure food reaches genuine people in need. ID proof required for individuals, registration documents for NGOs.
              </p>
              <div className="mt-4 flex items-center gap-2 text-primary-600 font-medium">
                <FiCheck className="w-5 h-5" />
                <span>100% Verified Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why Choose <span className="text-primary-600">Feed In Need?</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiTrendingUp className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Real-Time Tracking</h3>
                    <p className="text-gray-600">Track your donations from posting to pickup with live status updates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiShield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Verified Community</h3>
                    <p className="text-gray-600">All users are verified to ensure safe and genuine transactions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiGift className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Easy to Use</h3>
                    <p className="text-gray-600">Simple interface for posting donations and requesting food.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in-up">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-center">
                  <img src="/logo.png" alt="Feed In Need" className="w-24 h-24 mx-auto mb-4 object-contain" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Our Mission</h3>
                  <p className="text-gray-600">Be part of the change. Every donation counts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
