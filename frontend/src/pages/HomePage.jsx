/**
 * Home Page
 * Landing page with information about the platform
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiUsers, FiCheck, FiArrowRight, FiGift, FiShield, FiTrendingUp, FiExternalLink } from 'react-icons/fi';

// Stories data about hunger issues in Nepal
const hungerStories = [
  {
    id: 1,
    title: "Stunted Future",
    source: "The Kathmandu Post",
    summary: "For an agriculture-based economy, it is a shame that our children are hungry and undernourished. While Nepal has reduced stunting from 57% in 2001 to 25% in 2022, Karnali Province still has 36% stunted children. Malnutrition remains a critical challenge.",
    image: "https://assets-cdn.kathmandupost.com/uploads/source/news/2025/opinion/thumb5-1739931881.jpg",
    link: "https://kathmandupost.com/editorial/2025/02/19/stunted-future",
    date: "February 19, 2025"
  },
  {
    id: 2,
    title: "The Karnali's Hunger Emergency",
    source: "Nepali Times",
    summary: "Karnali Province faces a severe hunger crisis with thousands of families struggling for food security. Remote villages have limited access to supplies, and climate disasters continue to worsen the situation for vulnerable communities.",
    image: "https://assets-cdn.kathmandupost.com/uploads/source/news/2024/third-party/karnali-1708486697.jpg",
    link: "https://nepalitimes.com/here-now/the-karnali-s-hunger-emergency",
    date: "2024"
  },
  {
    id: 3,
    title: "Not Enough to Eat",
    source: "Asia News Network",
    summary: "Remote districts of Sudurpaschim Province like Bajhang face acute food crisis. In Saipal, around 2,800 people rely solely on government food subsidies. Villagers trek three days just to buy food items from district headquarters.",
    image: "https://asianews.network/wp-content/uploads/bfi_thumb/thumb-8-7l4fkv9w9rypufad2idr22sy1omi8r23eorw7s4bo74.jpg",
    link: "https://asianews.network/not-enough-to-eat-the-kathmandu-post/",
    date: "September 4, 2025"
  }
];

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

      {/* Hunger Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why This <span className="text-primary-600">Matters</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real stories highlighting the hunger crisis in Nepal. Together, we can make a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {hungerStories.map((story) => (
              <article
                key={story.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {story.source}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{story.date}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {story.summary}
                  </p>
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Read Full Story
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
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
