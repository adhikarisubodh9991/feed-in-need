/**
 * Admin Dashboard Page
 * Clean admin panel with statistics
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Loader from '../../components/Loader';
import { 
  FiPackage, 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiGift,
  FiGrid,
  FiUserCheck,
  FiInbox
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Completed Donations',
      value: stats?.donations?.completed || 0,
      icon: FiCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      link: '/admin/donations',
    },
    {
      title: 'Pending Approval',
      value: stats?.donations?.pendingApproval || 0,
      icon: FiClock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      link: '/admin/donations',
    },
    {
      title: 'Available Now',
      value: stats?.donations?.available || 0,
      icon: FiGift,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
      link: '/admin/donations',
    },
    {
      title: 'Claimed',
      value: stats?.donations?.claimed || 0,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      link: '/admin/donations',
    },
  ];

  const userStats = [
    {
      title: 'Total Donors',
      value: stats?.donors?.total || 0,
      pending: stats?.donors?.pending || 0,
      icon: FiGift,
      color: 'bg-cyan-500',
      link: '/admin/donors',
    },
    {
      title: 'Total Receivers',
      value: stats?.receivers?.total || 0,
      pending: stats?.receivers?.pending || 0,
      icon: FiUsers,
      color: 'bg-indigo-500',
      link: '/admin/receivers',
    },
    {
      title: 'Pending Requests',
      value: stats?.requests?.pending || 0,
      total: stats?.requests?.total || 0,
      icon: FiInbox,
      color: 'bg-orange-500',
      link: '/admin/requests',
    },
  ];

  const quickLinks = [
    { to: '/admin/donations', icon: FiPackage, label: 'Donations', color: 'bg-primary-100 text-primary-600' },
    { to: '/admin/donors', icon: FiGift, label: 'Donors', color: 'bg-cyan-100 text-cyan-600' },
    { to: '/admin/receivers', icon: FiUsers, label: 'Receivers', color: 'bg-indigo-100 text-indigo-600' },
    { to: '/admin/requests', icon: FiCheckCircle, label: 'Requests', color: 'bg-orange-100 text-orange-600' },
    { to: '/admin/users', icon: FiUserCheck, label: 'All Users', color: 'bg-pink-100 text-pink-600' },
  ];

  if (isSuperAdmin) {
    quickLinks.push({ to: '/admin/manage-admins', icon: FiShield, label: 'Manage Admins', color: 'bg-purple-100 text-purple-600' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
              <FiGrid className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-primary-100">Overview of your food donation platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Donation Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-${index + 1}`}
            >
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-').replace('-500', '-600')}`} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-600">{card.title}</p>
            </Link>
          ))}
        </div>

        {/* User Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {userStats.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group animate-fade-in-up"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                {card.pending > 0 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    {card.pending} pending
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-600">{card.title}</p>
              <div className="flex items-center gap-2 text-primary-600 font-medium mt-4 group-hover:gap-3 transition-all">
                View All <FiArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pending Receivers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                {(stats?.receivers?.pending || 0) + (stats?.donors?.pending || 0)}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Users waiting for account verification
            </p>
            <div className="flex gap-3">
              <Link
                to="/admin/receivers"
                className="flex-1 text-center px-4 py-2.5 bg-primary-50 text-primary-600 rounded-xl font-medium hover:bg-primary-100 transition-colors"
              >
                Receivers ({stats?.receivers?.pending || 0})
              </Link>
              <Link
                to="/admin/donors"
                className="flex-1 text-center px-4 py-2.5 bg-cyan-50 text-cyan-600 rounded-xl font-medium hover:bg-cyan-100 transition-colors"
              >
                Donors ({stats?.donors?.pending || 0})
              </Link>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Food Requests</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {stats?.requests?.pending || 0} pending
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Review and approve food donation requests
            </p>
            <Link
              to="/admin/requests"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors"
            >
              Review Requests <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Navigation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex flex-col items-center p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 ${link.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
