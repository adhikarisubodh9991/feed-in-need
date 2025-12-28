/**
 * Inbox Bell Component
 * Shows inbox icon with unread message count badge
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiInbox } from 'react-icons/fi';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const InboxBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get('/messages/unread-count');
      setUnreadCount(data.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Link
      to="/inbox"
      className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      title="Inbox"
    >
      <FiInbox size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default InboxBell;
