/**
 * Send Message Modal Component
 * Allows admin to send messages to users for profile corrections
 */

import { useState } from 'react';
import { FiX, FiSend, FiAlertCircle, FiMail } from 'react-icons/fi';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import Loader from './Loader';

const SendMessageModal = ({ isOpen, onClose, user, onMessageSent }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    actionRequired: '',
  });
  const [sending, setSending] = useState(false);

  // Preset message templates
  const templates = [
    {
      name: 'Invalid Phone Number',
      subject: 'Please Update Your Phone Number',
      message: 'We noticed that the phone number you provided appears to be invalid or incomplete. Please update your phone number in your profile to ensure we can contact you regarding food donations.',
      actionRequired: 'Update your phone number in your profile settings.',
    },
    {
      name: 'Unclear ID Document',
      subject: 'ID Document Update Required',
      message: 'The ID document you uploaded is unclear or not fully visible. Please upload a clear, legible copy of your ID proof for verification.',
      actionRequired: 'Re-upload a clear copy of your ID document.',
    },
    {
      name: 'Missing Organization Documents',
      subject: 'Organization Documents Required',
      message: 'We require additional documentation to verify your organization. Please upload your organization registration certificate or other relevant documents.',
      actionRequired: 'Upload organization registration documents.',
    },
    {
      name: 'Address Clarification',
      subject: 'Please Verify Your Address',
      message: 'We need to verify your address for delivery purposes. The address provided seems incomplete. Please update your profile with your complete address including landmark.',
      actionRequired: 'Update your complete address in profile.',
    },
    {
      name: 'General Information Request',
      subject: 'Profile Information Update',
      message: 'We need you to update some information in your profile to complete verification. Please review your profile and ensure all information is accurate and complete.',
      actionRequired: 'Review and update your profile information.',
    },
  ];

  if (!isOpen) return null;

  const handleTemplateSelect = (template) => {
    setFormData({
      subject: template.subject,
      message: template.message,
      actionRequired: template.actionRequired,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please provide subject and message');
      return;
    }

    setSending(true);
    try {
      await api.post(`/admin/users/${user._id}/message`, {
        subject: formData.subject,
        message: formData.message,
        actionRequired: formData.actionRequired || null,
      });
      
      toast.success('Message sent successfully!');
      onMessageSent?.();
      onClose();
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        actionRequired: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiMail className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Send Message to User</h3>
              <p className="text-sm text-gray-500">
                To: {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Quick Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Enter email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your message to the user..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Action Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiAlertCircle className="inline mr-1" />
                Action Required (Optional)
              </label>
              <input
                type="text"
                value={formData.actionRequired}
                onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                placeholder="What action should the user take?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be highlighted in the email as a required action.
              </p>
            </div>

            {/* Preview */}
            {(formData.subject || formData.message) && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-xs font-medium text-gray-500 mb-2">EMAIL PREVIEW</p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="font-medium text-gray-800 mb-2">{formData.subject || 'No subject'}</p>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{formData.message || 'No message'}</p>
                  {formData.actionRequired && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <strong>⚠️ Action Required:</strong> {formData.actionRequired}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <Loader size="small" color="white" />
                ) : (
                  <>
                    <FiSend />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
