import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiInbox, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrash2, 
  FiArrowLeft,
  FiCheck,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import axios from '../lib/axios';
import Loader from '../components/Loader';

const InboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/messages');
      setMessages(data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get('/messages/unread-count');
      setUnreadCount(data.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleToggleMessage = async (message) => {
    const isExpanding = expandedMessageId !== message._id;
    setExpandedMessageId(isExpanding ? message._id : null);
    
    // Mark as read if expanding and not already read
    if (isExpanding && !message.isRead) {
      try {
        await axios.put(`/messages/${message._id}/read`);
        setMessages(prev => 
          prev.map(m => 
            m._id === message._id ? { ...m, isRead: true, readAt: new Date() } : m
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/messages/read-all');
      setMessages(prev => prev.map(m => ({ ...m, isRead: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteMessage = async (e, messageId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await axios.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m._id !== messageId));
      if (expandedMessageId === messageId) {
        setExpandedMessageId(null);
      }
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (filter === 'unread') return !message.isRead;
    if (filter === 'read') return message.isRead;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/profile" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <FiInbox className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMessages}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors flex items-center gap-2"
                >
                  <FiCheck /> Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {['all', 'unread', 'read'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 -mb-px ${
                filter === tab 
                  ? 'text-primary-600 border-primary-500' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16">
              <FiMail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === 'all' 
                  ? 'No messages yet' 
                  : filter === 'unread' 
                    ? 'No unread messages' 
                    : 'No read messages'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map(message => {
                const isExpanded = expandedMessageId === message._id;
                
                return (
                  <div key={message._id} className="transition-all duration-200">
                    {/* Message Header - Click to expand */}
                    <div
                      onClick={() => handleToggleMessage(message)}
                      className={`p-4 cursor-pointer transition-colors ${
                        !message.isRead 
                          ? 'bg-blue-50 hover:bg-blue-100' 
                          : 'hover:bg-gray-50'
                      } ${isExpanded ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${!message.isRead ? 'text-primary-500' : 'text-gray-400'}`}>
                          {message.actionRequired ? (
                            <FiAlertCircle className="w-5 h-5 text-amber-500" />
                          ) : (
                            <FiMail className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={`text-sm ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                              {message.subject}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatShortDate(message.createdAt)}
                              </span>
                              {isExpanded ? (
                                <FiChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <FiChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          {!isExpanded && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {message.message.substring(0, 100)}...
                            </p>
                          )}
                          {message.actionRequired && !isExpanded && (
                            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                              Action Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Message Content */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-l-4 border-primary-500">
                        {/* Action Required Banner */}
                        {message.actionRequired && (
                          <div className="mx-4 mt-4 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                            <FiAlertCircle />
                            <span className="text-sm font-medium">This message requires your action</span>
                          </div>
                        )}
                        
                        {/* Message Body */}
                        <div className="p-4">
                          <div className="text-xs text-gray-500 mb-3">
                            From: <span className="font-medium">Admin</span> • {formatDate(message.createdAt)}
                          </div>
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {message.message}
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer Actions */}
                        <div className="px-4 pb-4 flex items-center justify-between">
                          {message.isRead && message.readAt && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FiCheckCircle className="text-green-500" />
                              Read on {formatDate(message.readAt)}
                            </p>
                          )}
                          <button
                            onClick={(e) => handleDeleteMessage(e, message._id)}
                            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
